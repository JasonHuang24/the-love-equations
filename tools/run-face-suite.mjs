import { spawnSync } from 'node:child_process';
if (Number(process.versions.node.split('.')[0]) < 20) {
  console.error('Face suite requires Node >=20. Older node --test can silently report no actual tests.');
  process.exit(2);
}
const result=spawnSync(process.execPath,['--test','tests/face-calculator.test.mjs'],{stdio:'inherit'});
if(result.error)throw result.error;
process.exit(result.status??2);