import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { preview } from 'vite';
import { contactApiPlugin } from '../server/vite-contact';
import { localRoutingPlugin } from '../server/local-routing';

export interface LocalPreviewOptions {
  host: string;
  port: number;
  root?: string;
}

export function parsePreviewArgs(args: string[]): LocalPreviewOptions {
  const options: LocalPreviewOptions = { host: '127.0.0.1', port: 4321 };
  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;
    const [flag, inline] = arg.split('=', 2);
    if (flag === '--host') {
      const value =
        inline ??
        (args[index + 1] && !args[index + 1]!.startsWith('--') ? args[++index] : '0.0.0.0');
      if (!value || /[\s/]/.test(value)) throw new Error('Invalid --host value');
      options.host = value;
    } else if (flag === '--port') {
      const value = inline ?? args[++index];
      if (!value || !/^\d+$/.test(value) || Number(value) > 65_535)
        throw new Error('Invalid --port value');
      options.port = Number(value);
    } else if (flag !== '--strictPort') {
      throw new Error(`Unknown preview argument: ${flag}`);
    }
  }
  return options;
}

/** Astro 7's static preview drops user Vite plugins; start Vite explicitly instead. */
export function startLocalPreview(
  options: LocalPreviewOptions = { host: '127.0.0.1', port: 4321 },
) {
  return preview({
    root: options.root || process.cwd(),
    configFile: false,
    appType: 'mpa',
    build: { outDir: 'dist' },
    preview: { host: options.host, port: options.port, strictPort: true },
    plugins: [contactApiPlugin(), localRoutingPlugin()],
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.info('Usage: npm run preview -- [--host 127.0.0.1] [--port 4321]');
  } else {
    const server = await startLocalPreview(parsePreviewArgs(process.argv.slice(2)));
    server.printUrls();
    server.bindCLIShortcuts({ print: true });
    let closing = false;
    const close = async () => {
      if (closing) return;
      closing = true;
      await server.close();
    };
    process.once('SIGINT', close);
    process.once('SIGTERM', close);
  }
}
