const nodemailer = require('nodemailer');

const brand = process.env.APP_NAME || 'Aurum Eats';

/** Gmail SMTP must send FROM the same account you authenticate (or a verified "Send mail as" alias). */
const getFromAddress = () => {
  const user = (process.env.EMAIL_USER || '').trim();
  const from = (process.env.EMAIL_FROM || '').trim();
  const service = (process.env.EMAIL_SERVICE || 'gmail').toLowerCase();

  if (!user) return from || 'noreply@localhost';

  if (service === 'gmail' && from && from.toLowerCase() !== user.toLowerCase()) {
    console.warn(
      `⚠️  EMAIL_FROM (${from}) differs from EMAIL_USER (${user}). ` +
        'Gmail often blocks delivery to other addresses unless "Send mail as" is configured. ' +
        'Set EMAIL_FROM to the same Gmail as EMAIL_USER, or add the alias in Gmail settings.'
    );
    return user;
  }

  return from || user;
};

const createTransporter = () => {
  const pass = (process.env.EMAIL_PASS || '').replace(/\s/g, '');
  const user = (process.env.EMAIL_USER || '').trim();
  const service = (process.env.EMAIL_SERVICE || 'gmail').toLowerCase();

  if (service === 'gmail') {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT, 10) || 587,
      secure: false,
      requireTLS: true,
      auth: { user, pass },
    });
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : undefined,
    secure: false,
    auth: { user, pass },
  });
};

let transporter;
const getTransporter = () => {
  if (!transporter) transporter = createTransporter();
  return transporter;
};

exports.verifyEmailConfig = async () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  EMAIL_USER / EMAIL_PASS not set — OTP emails will fail');
    return false;
  }
  try {
    await getTransporter().verify();
    console.log(`✅ Email ready (sending as ${getFromAddress()})`);
    return true;
  } catch (err) {
    console.error(`❌ Email SMTP check failed: ${err.message}`);
    return false;
  }
};

const wrap = content => `
  <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;background:#111;color:#f5f5f5;padding:36px;border-radius:8px;">
    <h1 style="color:#f59e0b;font-size:1.5rem;margin:0 0 24px;">${brand}</h1>
    ${content}
    <p style="color:#666;font-size:12px;margin-top:32px;border-top:1px solid #333;padding-top:16px;">© ${new Date().getFullYear()} ${brand}</p>
  </div>
`;

const sendMail = async ({ to, subject, html, text }) => {
  const from = getFromAddress();
  const info = await getTransporter().sendMail({
    from: `"${brand}" <${from}>`,
    to,
    subject,
    html,
    text,
  });
  console.log(`📧 Email sent → ${to} (id: ${info.messageId || 'n/a'})`);
  if (info.rejected?.length) {
    throw new Error(`Recipient rejected: ${info.rejected.join(', ')}`);
  }
  return info;
};

exports.sendOtpEmail = async (email, name, otp) => {
  const minutes = process.env.OTP_EXPIRE_MINUTES || 10;
  const code = String(otp);
  await sendMail({
    to: email,
    subject: `${brand} — Verify your email`,
    text: `Hi ${name},\n\nYour verification code is: ${code}\n\nExpires in ${minutes} minutes.`,
    html: wrap(`
      <p>Hi ${name},</p>
      <p>Your verification code is:</p>
      <p style="font-size:2rem;font-weight:700;letter-spacing:8px;color:#f59e0b;margin:24px 0;">${code}</p>
      <p style="color:#aaa;font-size:14px;">This code expires in ${minutes} minutes.</p>
      <p style="color:#aaa;font-size:14px;">Check spam/junk if you do not see this email.</p>
    `),
  });
};

exports.sendPasswordResetOtp = async (email, name, otp) => {
  const minutes = process.env.OTP_EXPIRE_MINUTES || 10;
  const code = String(otp);
  await sendMail({
    to: email,
    subject: `${brand} — Password reset code`,
    text: `Hi ${name},\n\nYour password reset code is: ${code}\n\nExpires in ${minutes} minutes.`,
    html: wrap(`
      <p>Hi ${name},</p>
      <p>Use this code to reset your password:</p>
      <p style="font-size:2rem;font-weight:700;letter-spacing:8px;color:#f59e0b;margin:24px 0;">${code}</p>
      <p style="color:#aaa;font-size:14px;">Expires in ${minutes} minutes. Ignore if you didn't request this.</p>
    `),
  });
};

exports.sendOrderConfirmation = async (user, order) => {
  const itemsHtml = order.items
    .map(
      i =>
        `<tr><td style="padding:8px 0;color:#ccc;">${i.name} × ${i.quantity}</td><td style="text-align:right;color:#fff;">£${(i.price * i.quantity).toFixed(2)}</td></tr>`
    )
    .join('');
  await sendMail({
    to: user.email,
    subject: `${brand} — Order #${order._id.toString().slice(-6).toUpperCase()} confirmed`,
    html: wrap(`
      <p>Hi ${user.name},</p>
      <p>Thanks for your order! We're preparing it now.</p>
      <table style="width:100%;margin:20px 0;border-collapse:collapse;">${itemsHtml}</table>
      <p style="font-size:1.1rem;"><strong>Total: £${order.totalAmount.toFixed(2)}</strong></p>
      <p style="color:#aaa;font-size:14px;">Payment: ${order.paymentMethod.toUpperCase()} · Status: ${order.status}</p>
      <p style="color:#aaa;font-size:14px;">Deliver to: ${order.address.street}, ${order.address.city} ${order.address.zip}</p>
    `),
  });
};

exports.sendReservationEmail = async () => {};
exports.sendContactEmail = async () => {};
