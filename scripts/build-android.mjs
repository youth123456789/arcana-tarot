import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = process.argv[2] === 'release' ? 'release' : 'debug';
const androidDir = path.join(root, 'android');
const task = mode === 'release' ? 'assembleRelease' : 'assembleDebug';

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', env: process.env });
  if (result.status !== 0) {
    console.error(`Command failed: ${command} ${args.join(' ')}`);
    process.exit(result.status || 1);
  }
}

if (!fs.existsSync(path.join(androidDir, 'gradlew.bat')) && !fs.existsSync(path.join(androidDir, 'gradlew'))) {
  console.error('Android project is missing. Run `npx cap add android` first.');
  process.exit(1);
}

console.log(`Syncing web assets into Capacitor (${mode})...`);
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
run(npx, ['cap', 'sync', 'android'], root);

console.log(`Building Android ${mode} APK...`);
if (process.platform === 'win32') {
  run('cmd.exe', ['/c', 'gradlew.bat', task], androidDir);
} else {
  run('./gradlew', [task], androidDir);
}

const source = path.join(androidDir, 'app', 'build', 'outputs', 'apk', mode, `app-${mode}.apk`);
if (!fs.existsSync(source)) {
  console.error(`APK not found at ${source}`);
  process.exit(1);
}

const distDir = path.join(root, 'dist');
fs.mkdirSync(distDir, { recursive: true });
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const target = path.join(distDir, `arcana-${pkg.version}-${mode}.apk`);
fs.copyFileSync(source, target);
console.log(`APK ready: ${target}`);
