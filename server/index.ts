import { spawn } from 'child_process';

function log(message: string) {
  const time = new Date().toLocaleTimeString();
  console.log(`${time} [next.js] ${message}`);
}

const port = parseInt(process.env.PORT || '5000', 10);

log(`Starting Next.js server on port ${port}...`);

const nextDev = spawn('npx', ['next', 'dev', '-p', port.toString()], {
  stdio: 'inherit',
  env: { ...process.env },
  cwd: process.cwd(),
});

nextDev.on('error', (error) => {
  log(`Failed to start Next.js: ${error.message}`);
  process.exit(1);
});

nextDev.on('close', (code) => {
  log(`Next.js exited with code ${code}`);
  process.exit(code || 0);
});

process.on('SIGTERM', () => {
  nextDev.kill('SIGTERM');
});

process.on('SIGINT', () => {
  nextDev.kill('SIGINT');
});
