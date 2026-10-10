import {
  App,
  BootstraplessSynthesizer,
  CfnOutput,
  CfnParameter,
  Duration,
  RemovalPolicy,
  Stack,
  Tags,
} from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cf from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as apigw from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cw from 'aws-cdk-lib/aws-cloudwatch';
import * as actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as budgets from 'aws-cdk-lib/aws-budgets';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { resolve } from 'node:path';

const app = new App();
const certificateArn =
  app.node.tryGetContext('certificateArn') ||
  'arn:aws:acm:us-east-1:541855874226:certificate/00000000-0000-0000-0000-000000000000';
if (!/^arn:aws:acm:us-east-1:541855874226:certificate\/[\da-f-]{36}$/.test(certificateArn))
  throw new Error('Certificate must belong to tvujkarel-prod in us-east-1');
const stack = new Stack(app, 'TvujKarelHosting', {
  env: { account: '541855874226', region: 'eu-central-1' },
});
Tags.of(stack).add('Project', 'tvujkarel');
const originToken = new CfnParameter(stack, 'OriginToken', {
  type: 'String',
  noEcho: true,
  minLength: 32,
});
const alertEmail = new CfnParameter(stack, 'AlertEmail', {
  type: 'String',
  allowedPattern: '[^\\s@]+@[^\\s@]+\\.[^\\s@]+',
});
const budget = new CfnParameter(stack, 'MonthlyBudgetUsd', {
  type: 'Number',
  default: 5,
  minValue: 1,
});

const bucket = new s3.Bucket(stack, 'Website', {
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  encryption: s3.BucketEncryption.S3_MANAGED,
  enforceSSL: true,
  versioned: true,
  removalPolicy: RemovalPolicy.RETAIN,
  lifecycleRules: [
    {
      noncurrentVersionExpiration: Duration.days(30),
      abortIncompleteMultipartUploadAfter: Duration.days(1),
    },
  ],
});
const logGroup = new logs.LogGroup(stack, 'ContactLogs', {
  retention: logs.RetentionDays.TWO_WEEKS,
  removalPolicy: RemovalPolicy.RETAIN,
});
const contact = new lambda.Function(stack, 'Contact', {
  runtime: lambda.Runtime.NODEJS_22_X,
  handler: 'index.handler',
  architecture: lambda.Architecture.ARM_64,
  code: lambda.Code.fromAsset(resolve('build/lambda')),
  // New AWS account has a concurrency quota of 10; reservations require leaving
  // at least 100 unreserved executions. API Gateway throttling bounds ingress.
  memorySize: 128,
  timeout: Duration.seconds(15),
  logGroup,
  environment: {
    CONTACT_MODE: 'disabled',
    CONTACT_ALLOWED_ORIGINS: 'https://tvujkarel.cz',
    CONTACT_SES_REGION: 'eu-central-1',
    CONTACT_ORIGIN_TOKEN: originToken.valueAsString,
  },
});
// The preview role intentionally has no SES sending permission.
const api = new apigw.HttpApi(stack, 'ContactApi', { createDefaultStage: false });
api.addRoutes({
  path: '/api/contact',
  methods: [apigw.HttpMethod.POST],
  integration: new integrations.HttpLambdaIntegration('ContactIntegration', contact),
});
const apiLogs = new logs.LogGroup(stack, 'ApiLogs', {
  retention: logs.RetentionDays.TWO_WEEKS,
  removalPolicy: RemovalPolicy.RETAIN,
});
new apigw.CfnStage(stack, 'ApiStage', {
  apiId: api.httpApiId,
  stageName: '$default',
  autoDeploy: true,
  defaultRouteSettings: { throttlingRateLimit: 2, throttlingBurstLimit: 5 },
  accessLogSettings: {
    destinationArn: apiLogs.logGroupArn,
    format:
      '{"requestId":"$context.requestId","status":"$context.status","route":"$context.routeKey","latency":"$context.responseLatency"}',
  },
});
const routing = new cf.Function(stack, 'Routing', {
  code: cf.FunctionCode.fromFile({ filePath: resolve('infra/edge.js') }),
  runtime: cf.FunctionRuntime.JS_2_0,
});
const headers = new cf.ResponseHeadersPolicy(stack, 'SecurityHeaders', {
  securityHeadersBehavior: {
    contentTypeOptions: { override: true },
    frameOptions: { frameOption: cf.HeadersFrameOption.DENY, override: true },
    referrerPolicy: {
      referrerPolicy: cf.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
      override: true,
    },
    strictTransportSecurity: {
      accessControlMaxAge: Duration.days(365),
      includeSubdomains: true,
      override: true,
    },
  },
  customHeadersBehavior: {
    customHeaders: [{ header: 'X-Robots-Tag', value: 'noindex, nofollow', override: true }],
  },
});
const htmlCache = new cf.CachePolicy(stack, 'HtmlCache', {
  minTtl: Duration.seconds(0),
  defaultTtl: Duration.minutes(5),
  maxTtl: Duration.hours(1),
  enableAcceptEncodingGzip: true,
  enableAcceptEncodingBrotli: true,
});
const associations = [{ eventType: cf.FunctionEventType.VIEWER_REQUEST, function: routing }];
const staticOrigin = origins.S3BucketOrigin.withOriginAccessControl(bucket);
const distribution = new cf.Distribution(stack, 'Cdn', {
  domainNames: ['tvujkarel.cz', 'www.tvujkarel.cz'],
  certificate: acm.Certificate.fromCertificateArn(stack, 'Certificate', certificateArn),
  minimumProtocolVersion: cf.SecurityPolicyProtocol.TLS_V1_2_2021,
  priceClass: cf.PriceClass.PRICE_CLASS_100,
  defaultBehavior: {
    origin: staticOrigin,
    viewerProtocolPolicy: cf.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    cachePolicy: htmlCache,
    responseHeadersPolicy: headers,
    functionAssociations: associations,
  },
  additionalBehaviors: {
    '/_astro/*': {
      origin: staticOrigin,
      viewerProtocolPolicy: cf.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      cachePolicy: cf.CachePolicy.CACHING_OPTIMIZED,
      responseHeadersPolicy: headers,
      functionAssociations: associations,
    },
    '/api/*': {
      origin: new origins.HttpOrigin(`${api.httpApiId}.execute-api.eu-central-1.amazonaws.com`, {
        protocolPolicy: cf.OriginProtocolPolicy.HTTPS_ONLY,
        customHeaders: { 'x-tvujkarel-origin': originToken.valueAsString },
      }),
      viewerProtocolPolicy: cf.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      allowedMethods: cf.AllowedMethods.ALLOW_ALL,
      cachePolicy: cf.CachePolicy.CACHING_DISABLED,
      originRequestPolicy: new cf.OriginRequestPolicy(stack, 'ApiForwarding', {
        headerBehavior: cf.OriginRequestHeaderBehavior.allowList(
          'Origin',
          'Content-Type',
          'x-tvujkarel-client-ip',
        ),
      }),
      responseHeadersPolicy: headers,
      functionAssociations: associations,
    },
  },
  errorResponses: [403, 404].map((httpStatus) => ({
    httpStatus,
    responseHttpStatus: 404,
    responsePagePath: '/404.html',
    ttl: Duration.seconds(0),
  })),
});
new s3deploy.BucketDeployment(stack, 'Publish', {
  logGroup: new logs.LogGroup(stack, 'DeploymentLogs', {
    retention: logs.RetentionDays.TWO_WEEKS,
    removalPolicy: RemovalPolicy.RETAIN,
  }),
  sources: [s3deploy.Source.asset(resolve('dist'))],
  destinationBucket: bucket,
  distribution,
  distributionPaths: ['/*'],
  prune: true,
  retainOnDelete: true,
  cacheControl: [s3deploy.CacheControl.fromString('public,max-age=300')],
});
const topic = new sns.Topic(stack, 'Operations');
new sns.Subscription(stack, 'Operator', {
  topic,
  protocol: sns.SubscriptionProtocol.EMAIL,
  endpoint: alertEmail.valueAsString,
});
const errorAlarm = new cw.Alarm(stack, 'LambdaErrors', {
  metric: contact.metricErrors({ period: Duration.minutes(5) }),
  threshold: 1,
  evaluationPeriods: 1,
  treatMissingData: cw.TreatMissingData.NOT_BREACHING,
});
errorAlarm.addAlarmAction(new actions.SnsAction(topic));
const apiAlarm = new cw.Alarm(stack, 'ApiErrors', {
  // Valid preview submissions intentionally return 503; those are not incidents.
  // Enable API alarm actions together with CONTACT_MODE=ses at the public launch.
  actionsEnabled: false,
  metric: new cw.Metric({
    namespace: 'AWS/ApiGateway',
    metricName: '5xx',
    dimensionsMap: { ApiId: api.httpApiId },
    statistic: 'Sum',
    period: Duration.minutes(5),
  }),
  threshold: 1,
  evaluationPeriods: 1,
  treatMissingData: cw.TreatMissingData.NOT_BREACHING,
});
apiAlarm.addAlarmAction(new actions.SnsAction(topic));
const throttleAlarm = new cw.Alarm(stack, 'LambdaThrottles', {
  metric: contact.metricThrottles({ period: Duration.minutes(5) }),
  threshold: 1,
  evaluationPeriods: 1,
  treatMissingData: cw.TreatMissingData.NOT_BREACHING,
});
throttleAlarm.addAlarmAction(new actions.SnsAction(topic));
new budgets.CfnBudget(stack, 'Budget', {
  budget: {
    budgetName: 'tvujkarel-monthly',
    budgetType: 'COST',
    timeUnit: 'MONTHLY',
    budgetLimit: { amount: budget.valueAsNumber, unit: 'USD' },
  },
  notificationsWithSubscribers: [80, 100].map((threshold) => ({
    notification: {
      comparisonOperator: 'GREATER_THAN',
      notificationType: 'ACTUAL',
      threshold,
      thresholdType: 'PERCENTAGE',
    },
    subscribers: [{ subscriptionType: 'EMAIL', address: alertEmail.valueAsString }],
  })),
});
const oidc = new iam.CfnOIDCProvider(stack, 'GitHubOidc', {
  url: 'https://token.actions.githubusercontent.com',
  clientIdList: ['sts.amazonaws.com'],
});
const ciRole = new iam.Role(stack, 'GitHubDeploy', {
  roleName: 'tvujkarel-github-deploy',
  assumedBy: new iam.WebIdentityPrincipal(oidc.attrArn, {
    StringEquals: {
      'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
      'token.actions.githubusercontent.com:sub':
        'repo:lukasniedoba/tvujkarel:environment:production',
    },
  }),
});
ciRole.addToPolicy(
  new iam.PolicyStatement({
    actions: ['sts:AssumeRole'],
    resources: ['arn:aws:iam::541855874226:role/cdk-hnb659fds-*-541855874226-eu-central-1'],
  }),
);
ciRole.addToPolicy(
  new iam.PolicyStatement({
    actions: [
      'cloudformation:DescribeStacks',
      'cloudformation:DescribeStackEvents',
      'cloudformation:GetTemplate',
      'cloudformation:GetTemplateSummary',
    ],
    resources: [
      'arn:aws:cloudformation:eu-central-1:541855874226:stack/TvujKarelHosting/*',
      'arn:aws:cloudformation:eu-central-1:541855874226:stack/CDKToolkit/*',
    ],
  }),
);
for (const [name, value] of Object.entries({
  BucketName: bucket.bucketName,
  DistributionId: distribution.distributionId,
  DistributionDomain: distribution.distributionDomainName,
  ApiUrl: api.apiEndpoint,
  DeployRoleArn: ciRole.roleArn,
  OperationsTopicArn: topic.topicArn,
}))
  new CfnOutput(stack, name, { value });

// Asset-free DNS template is deployed directly by CloudFormation in the DNS account.
const dns = new Stack(app, 'TvujKarelDns', {
  env: { account: '890192513455', region: 'eu-central-1' },
  synthesizer: new BootstraplessSynthesizer(),
});
const cdnDomain = new CfnParameter(dns, 'DistributionDomain', {
  type: 'String',
  allowedPattern: '[a-z0-9]+\\.cloudfront\\.net',
});
for (const name of ['tvujkarel.cz', 'www.tvujkarel.cz'])
  for (const type of ['A', 'AAAA'])
    new route53.CfnRecordSet(dns, `${name}-${type}`, {
      hostedZoneId: 'Z076204315B86GU4PJHXB',
      name,
      type,
      aliasTarget: {
        dnsName: cdnDomain.valueAsString,
        hostedZoneId: 'Z2FDTNDATAQYW2',
        evaluateTargetHealth: false,
      },
    });
