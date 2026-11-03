require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { sendOtpEmail, verifyEmailConfig } = require('../config/email');

const to = process.argv[2];
if (!to) {
  console.error('Usage: node scripts/test-email.js recipient@example.com');
  process.exit(1);
}

(async () => {
  const ok = await verifyEmailConfig();
  if (!ok) process.exit(1);
  const info = await sendOtpEmail(to, 'Test User', 123456);
  console.log('Sent to', to, info || '(ok)');
})().catch(err => {
  console.error('Failed:', err.message);
  process.exit(1);
});
