import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const prodProfile = 'administrator-tvujkarel-prod';
const dnsProfile = 'administrator-tvujkarel-dns';
const zone = 'Z076204315B86GU4PJHXB';
mkdirSync('.deployment', { recursive: true, mode: 0o700 });
const aws = (profile, args) =>
  JSON.parse(
    execFileSync(
      'aws',
      [
        ...args,
        '--profile',
        profile,
        ...(args.includes('--region') ? [] : ['--region', 'eu-central-1']),
        '--output',
        'json',
      ],
      { encoding: 'utf8' },
    ),
  );
function identity(profile, expected) {
  if (aws(profile, ['sts', 'get-caller-identity']).Account !== expected)
    throw new Error(`Wrong AWS account for ${profile}`);
}
const save = (name, data) =>
  writeFileSync(`.deployment/${name}`, JSON.stringify(data, null, 2) + '\n', { mode: 0o600 });
const run = (command, args, env = {}) => {
  // npm exec prints argv at notice level, including secret-valued parameters.
  if (command === 'npx' && args[0] === 'cdk') {
    command = process.execPath;
    args = [resolve('node_modules/aws-cdk/bin/cdk'), ...args.slice(1)];
  }
  try {
    execFileSync(command, args, {
      stdio: 'inherit',
      env: { ...process.env, CDK_DISABLE_CLI_TELEMETRY: '1', ...env },
    });
  } catch (error) {
    // execFileSync's default exception includes argv, which may contain the origin token.
    throw new Error(`${command} failed with exit code ${error.status ?? 'unknown'}`);
  }
};
identity(prodProfile, '541855874226');
identity(dnsProfile, '890192513455');
const action = process.argv[2];
if (action === 'certificate') {
  let arn;
  if (existsSync('.deployment/certificate.json'))
    arn = JSON.parse(readFileSync('.deployment/certificate.json', 'utf8')).arn;
  else {
    const list = aws(prodProfile, [
      'acm',
      'list-certificates',
      '--region',
      'us-east-1',
    ]).CertificateSummaryList;
    arn = list.find(
      (item) =>
        item.DomainName === 'tvujkarel.cz' &&
        ['PENDING_VALIDATION', 'ISSUED'].includes(item.Status),
    )?.CertificateArn;
    if (!arn)
      arn = aws(prodProfile, [
        'acm',
        'request-certificate',
        '--region',
        'us-east-1',
        '--domain-name',
        'tvujkarel.cz',
        '--subject-alternative-names',
        'www.tvujkarel.cz',
        '--validation-method',
        'DNS',
        '--idempotency-token',
        'tvujkarelpreview',
        '--tags',
        'Key=Project,Value=tvujkarel',
      ]).CertificateArn;
    save('certificate.json', { arn });
  }
  let certificate;
  for (let attempt = 0; attempt < 12; attempt++) {
    certificate = aws(prodProfile, [
      'acm',
      'describe-certificate',
      '--region',
      'us-east-1',
      '--certificate-arn',
      arn,
    ]).Certificate;
    if (certificate.DomainValidationOptions.every((item) => item.ResourceRecord)) break;
    await new Promise((done) => setTimeout(done, 5000));
  }
  if (!certificate.SubjectAlternativeNames.includes('www.tvujkarel.cz'))
    throw new Error('Certificate lacks www SAN');
  const current = aws(dnsProfile, [
    'route53',
    'list-resource-record-sets',
    '--hosted-zone-id',
    zone,
  ]).ResourceRecordSets;
  const changes = new Map();
  for (const item of certificate.DomainValidationOptions) {
    const record = item.ResourceRecord;
    if (!record) throw new Error('ACM validation records not ready; rerun certificate command');
    const existing = current.find(
      (value) => value.Name === record.Name && value.Type === record.Type,
    );
    if (existing && existing.ResourceRecords?.[0]?.Value !== record.Value)
      throw new Error('Conflicting ACM validation record; refusing overwrite');
    changes.set(record.Name, {
      Action: 'UPSERT',
      ResourceRecordSet: {
        Name: record.Name,
        Type: record.Type,
        TTL: 300,
        ResourceRecords: [{ Value: record.Value }],
      },
    });
  }
  const result = aws(dnsProfile, [
    'route53',
    'change-resource-record-sets',
    '--hosted-zone-id',
    zone,
    '--change-batch',
    JSON.stringify({
      Comment: 'TvujKarel production ACM validation',
      Changes: [...changes.values()],
    }),
  ]);
  save('certificate.json', { arn, dnsChangeId: result.ChangeInfo.Id });
  console.log('ACM request and validation CNAME records prepared:', arn);
  console.log('Wait for ACM ISSUED before deploy. No website DNS records changed.');
} else if (action === 'deploy') {
  if (!process.argv.includes('--apply'))
    throw new Error(
      'Use --apply after reviewing the deployment and approving its operating budget',
    );
  const config = JSON.parse(readFileSync('.deployment/config.json', 'utf8'));
  if (
    !config.alertEmail ||
    !Number.isFinite(config.monthlyBudgetUsd) ||
    config.monthlyBudgetUsd < 1
  )
    throw new Error('Set alertEmail and approved monthlyBudgetUsd in .deployment/config.json');
  const { arn } = JSON.parse(readFileSync('.deployment/certificate.json', 'utf8'));
  if (
    aws(prodProfile, [
      'acm',
      'describe-certificate',
      '--region',
      'us-east-1',
      '--certificate-arn',
      arn,
    ]).Certificate.Status !== 'ISSUED'
  )
    throw new Error('ACM certificate not ISSUED');
  const records = aws(dnsProfile, [
    'route53',
    'list-resource-record-sets',
    '--hosted-zone-id',
    zone,
  ]).ResourceRecordSets;
  // A first deployment may add records; existing unmanaged web records require review.
  const dnsStacks = aws(dnsProfile, [
    'cloudformation',
    'list-stacks',
    '--stack-status-filter',
    'CREATE_COMPLETE',
    'UPDATE_COMPLETE',
  ]).StackSummaries;
  if (
    !dnsStacks.some((item) => item.StackName === 'TvujKarelDns') &&
    records.some(
      (item) =>
        ['tvujkarel.cz.', 'www.tvujkarel.cz.'].includes(item.Name) &&
        ['A', 'AAAA', 'CNAME'].includes(item.Type),
    )
  )
    throw new Error('Existing unmanaged website DNS records; refusing replacement');
  if (!existsSync('.deployment/origin-token'))
    writeFileSync('.deployment/origin-token', randomBytes(32).toString('hex'), { mode: 0o600 });
  const originToken = readFileSync('.deployment/origin-token', 'utf8').trim();
  run('npm', ['run', 'build'], {
    PUBLIC_SITE_MODE: 'preview',
    CONTACT_MODE: 'disabled',
    PUBLIC_SITE_URL: 'https://tvujkarel.cz',
  });
  run('npm', ['run', 'build:infra']);
  run('npx', ['cdk', 'synth', '-c', `certificateArn=${arn}`]);
  const release = resolve('.deployment/releases', new Date().toISOString().replaceAll(':', '-'));
  mkdirSync(release, { recursive: true });
  cpSync('cdk.out', `${release}/cdk.out`, { recursive: true });
  writeFileSync(
    `${release}/release.json`,
    JSON.stringify(
      {
        created: new Date().toISOString(),
        mode: 'preview',
        certificateArn: arn,
        gitHead: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
        dirty: Boolean(execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim()),
      },
      null,
      2,
    ),
  );
  run(
    'npx',
    ['cdk', 'diff', 'TvujKarelHosting', '--app', `${release}/cdk.out`, '--no-change-set'],
    { AWS_PROFILE: prodProfile },
  );
  run(
    'npx',
    [
      'cdk',
      'deploy',
      'TvujKarelHosting',
      '--app',
      `${release}/cdk.out`,
      '--require-approval',
      'never',
      '--outputs-file',
      '.deployment/outputs.json',
      '--parameters',
      `OriginToken=${originToken}`,
      '--parameters',
      `AlertEmail=${config.alertEmail}`,
      '--parameters',
      `MonthlyBudgetUsd=${config.monthlyBudgetUsd}`,
    ],
    { AWS_PROFILE: prodProfile },
  );
  const outputs = JSON.parse(readFileSync('.deployment/outputs.json', 'utf8')).TvujKarelHosting;
  run('aws', [
    'cloudformation',
    'deploy',
    '--profile',
    dnsProfile,
    '--region',
    'eu-central-1',
    '--stack-name',
    'TvujKarelDns',
    '--template-file',
    `${release}/cdk.out/TvujKarelDns.template.json`,
    '--parameter-overrides',
    `DistributionDomain=${outputs.DistributionDomain}`,
    '--no-fail-on-empty-changeset',
  ]);
  save('current-release.json', { release, ...outputs });
  run('node', ['scripts/verify-deployment.mjs', '--public-dns']);
  console.log(`Deployment complete. Preserved rollback assembly: ${release}/cdk.out`);
} else if (action === 'rotate') {
  if (!process.argv.includes('--apply')) throw new Error('Token rotation requires --apply');
  const { release } = JSON.parse(readFileSync('.deployment/current-release.json', 'utf8'));
  const token = randomBytes(32).toString('hex');
  run(
    'npx',
    [
      'cdk',
      'deploy',
      'TvujKarelHosting',
      '--app',
      `${release}/cdk.out`,
      '--require-approval',
      'never',
      '--parameters',
      `OriginToken=${token}`,
    ],
    { AWS_PROFILE: prodProfile },
  );
  writeFileSync('.deployment/origin-token', token, { mode: 0o600 });
  console.log('Origin token rotated; no token values were logged.');
} else throw new Error('Expected certificate, deploy, or rotate');
