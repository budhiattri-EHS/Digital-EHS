/**
 * ==============================================================================
 * AUTO-PUSH TO GITHUB REPOSITORY
 * Pushes main branch to https://github.com/budhiattri-EHS/sbl-digital-ehs-management-system
 * ==============================================================================
 */

const { execSync } = require('child_process');

console.log('🚀 Pushing committed codebase to GitHub repository...');
try {
  const output = execSync('"C:\\Program Files\\Git\\cmd\\git.exe" push -u origin main', { encoding: 'utf8' });
  console.log(output);
  console.log('✅ PUSH SUCCESSFUL!');
  console.log('Repository URL: https://github.com/budhiattri-EHS/sbl-digital-ehs-management-system');
} catch (err) {
  console.error('Push failed:', err.message);
  if (err.stderr) console.error(err.stderr.toString());
}
