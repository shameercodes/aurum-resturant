const https = require("https");

const brand = process.env.APP_NAME || "Aurum Eats";

const getFromAddress = () => (process.env.EMAIL_FROM || "").trim();

const verifyEmailConfig = async () => {
  const apiKey = process.env.BREVO_API_KEY;
  const from = getFromAddress();

  if (!apiKey || !from) {
    console.error("❌ BREVO_API_KEY or EMAIL_FROM is missing.");
    return false;
  }

  console.log(`✅ Brevo API configured (sending as ${from})`);
  return true;
};

exports.verifyEmailConfig = verifyEmailConfig;

const wrap = (content) => `
  <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;background:#111;color:#f5f5f5;padding:36px;border-radius:8px;">
    <h1 style="color:#f59e0b;font-size:1.5rem;margin:0 0 24px;">${brand}</h1>
    ${content}
    <p style="color:#666;font-size:12px;margin-top:32px;border-top:1px solid #333;padding-top:16px;">© ${new Date().getFullYear()} ${brand}</p>
  </div>
`;

const sendMail = async ({ to, subject, html, text }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const from = getFromAddress();
  const senderName = process.env.EMAIL_FROM_NAME || brand;

  if (!apiKey || !from) {
    throw new Error("Brevo API configuration is missing.");
  }

  const recipients = (Array.isArray(to) ? to : [to]).map((item) =>
    typeof item === "string" ? { email: item } : item,
  );

  const payload = JSON.stringify({
    sender: {
      name: senderName,
      email: from,
    },
    to: recipients,
    subject,
    htmlContent: html,
    textContent: text || "",
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.brevo.com",
        path: "/v3/smtp/email",
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": apiKey,
          "content-type": "application/json",
          "content-length": Buffer.byteLength(payload),
        },
        timeout: 15000,
      },
      (res) => {
        let responseData = "";

        res.on("data", (chunk) => {
          responseData += chunk;
        });

        res.on("end", () => {
          let result = {};

          try {
            result = responseData ? JSON.parse(responseData) : {};
          } catch {
            result = { message: responseData };
          }

          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(
              `✅ Email accepted by Brevo (ID: ${result.messageId || "n/a"})`,
            );
            return resolve(result);
          }

          const error = new Error(
            result.message || `Brevo API error: ${res.statusCode}`,
          );

          error.code = res.statusCode;
          error.response = result;

          reject(error);
        });
      },
    );

    req.on("error", reject);

    req.on("timeout", () => {
      req.destroy(new Error("Brevo API request timed out."));
    });

    req.write(payload);
    req.end();
  });
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
  const orderNumber = order._id.toString().slice(-6).toUpperCase();

  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;color:#ccc;">
            ${item.name} × ${item.quantity}
          </td>
          <td style="text-align:right;color:#fff;">
            £${(item.price * item.quantity).toFixed(2)}
          </td>
        </tr>`,
    )
    .join("");

  await sendMail({
    to: user.email,
    subject: `${brand} — Your Order #${orderNumber} is Confirmed`,
    text: `Hi ${user.name},

Thank you for your order!

Your order #${orderNumber} has been successfully received.

Total: £${order.totalAmount.toFixed(2)}
Payment: ${order.paymentMethod.toUpperCase()}
Status: ${order.status}

Thank you for choosing ${brand}!`,

    html: wrap(`
      <h2 style="color:#22c55e;">Order Confirmed!</h2>

      <p>Hi ${user.name},</p>

      <p>
        Thank you for your order! We have successfully received
        your order and will update you as it progresses.
      </p>

      <p>
        Order number:
        <strong>#${orderNumber}</strong>
      </p>

      <table style="width:100%;margin:20px 0;border-collapse:collapse;">
        ${itemsHtml}
      </table>

      <p style="font-size:1.1rem;">
        <strong>Total: £${order.totalAmount.toFixed(2)}</strong>
      </p>

      <p style="color:#aaa;font-size:14px;">
        Payment: ${order.paymentMethod.toUpperCase()}
      </p>

      <p style="color:#aaa;font-size:14px;">
        Order Status: ${order.status}
      </p>

      <p style="color:#aaa;font-size:14px;">
        Delivery Address:
        ${order.address.street}, ${order.address.city}
        ${order.address.zip}
      </p>
    `),
  });
};

exports.sendOrderStatusEmail = async (user, order) => {
  const orderNumber = order._id.toString().slice(-6).toUpperCase();

  const statusMessages = {
    preparing: {
      subject: "Your order is being prepared",
      message:
        "Our kitchen is preparing your order. We'll notify you when it is on its way.",
    },
    out_for_delivery: {
      subject: "Your order is out for delivery",
      message: "Your order is on its way! Please get ready to receive it.",
    },
    delivered: {
      subject: "Your order has been delivered",
      message: "Your order has been delivered. Thank you for choosing us!",
    },
    cancelled: {
      subject: "Your order has been cancelled",
      message:
        "Your order has been cancelled. Please contact us if you have any questions.",
    },
  };

  const notification = statusMessages[order.status];

  if (!notification) return;

  await sendMail({
    to: user.email,
    subject: `${brand} — ${notification.subject} (#${orderNumber})`,
    text: `Hi ${user.name},\n\n${notification.message}\n\nOrder #${orderNumber}`,
    html: wrap(`
      <p>Hi ${user.name},</p>
      <h2 style="color:#f59e0b;">${notification.subject}</h2>
      <p>${notification.message}</p>
      <p>Order number: <strong>#${orderNumber}</strong></p>
      <p>Current status: <strong>${order.status.replaceAll("_", " ")}</strong></p>
    `),
  });
};

exports.sendReservationEmail = async () => {};
exports.sendContactEmail = async () => {};
