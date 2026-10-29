// Entry point for `npm run cli`. Loads .env.local then .env (shell values win,
// as with Next) before the lib modules read process.env, then runs the CLI.
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(__dirname, '..');
for (const file of ['.env.local', '.env']) {
  const path = resolve(root, file);
  if (existsSync(path)) process.loadEnvFile(path);
}

// Exit quietly when piped into something that closes early, like `head`.
process.stdout.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EPIPE') process.exit(0);
  throw err;
});

const stdin = async () => {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString('utf8');
};

import('./solardapt')
  .then(({ main }) =>
    main(process.argv.slice(2), {
      out: (l) => console.log(l),
      err: (l) => console.error(l),
      stdin,
    }),
  )
  .then((code) => {
    process.exitCode = code;
  });
