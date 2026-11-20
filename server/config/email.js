const https = require("https");

const User = require("../models/User");

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

// const getAdminEmail = async () => {
//   const admin = await User.findOne({
//     role: "admin",
//     isVerified: true,
//   }).select("email");

//   if (!admin?.email) {
//     throw new Error("Verified admin email not found.");
//   }

//   return admin.email;
// };
const getAdminEmail = async () => {
  console.log("🔍 Searching for verified admin...");

  const admin = await User.findOne({
    role: "admin",
    isVerified: true,
  }).select("email role isVerified");

  console.log("👤 Admin lookup result:", admin);

  if (!admin?.email) {
    throw new Error("Verified admin email not found.");
  }

  console.log("📧 Admin notification recipient found:", admin.email);

  return admin.email;
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

  const itemsText = order.items
    .map(
      (item) =>
        `${item.name} x ${item.quantity} — £${(
          item.price * item.quantity
        ).toFixed(2)}`,
    )
    .join("\n");

  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px;color:#ccc;">
            ${escapeHtml(item.name)} × ${item.quantity}
          </td>
          <td style="padding:10px;text-align:right;color:#fff;">
            £${(item.price * item.quantity).toFixed(2)}
          </td>
        </tr>
      `,
    )
    .join("");

  await sendMail({
    to: user.email,
    subject: `${brand} — Order Confirmation #${orderNumber}`,

    text: `Hi ${user.name},

Thank you for your order!

Order: #${orderNumber}

${itemsText}

Total: £${Number(order.totalAmount).toFixed(2)}
Payment: ${order.paymentMethod}
Status: ${order.status}

Thank you for choosing ${brand}.`,

    html: wrap(`
      <h2 style="color:#f59e0b;">Order Confirmed!</h2>

      <p>Hi ${escapeHtml(user.name)},</p>
      <p>Thank you for placing your order with ${brand}.</p>

      <p><strong>Order Number:</strong> #${orderNumber}</p>

      <table style="width:100%;border-collapse:collapse;">
        ${itemsHtml}
      </table>

      <div style="background:#222;padding:20px;border-radius:8px;">
        <p><strong>Total:</strong> £${Number(order.totalAmount).toFixed(2)}</p>
        <p><strong>Payment:</strong> ${escapeHtml(order.paymentMethod)}</p>
        <p><strong>Status:</strong> ${escapeHtml(order.status)}</p>
      </div>

      <p>Thank you for choosing ${brand}!</p>
    `),
  });

  console.log("✅ Customer order confirmation email sent:", user.email);
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


const escapeHtml = (value = "") =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );


exports.sendAdminOrderNotification = async (order) => {
  const adminEmail = await getAdminEmail();

  const orderNumber = order._id.toString().slice(-6).toUpperCase();
  const customer = order.user;

  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px;color:#ccc;">
            ${escapeHtml(item.name)} × ${item.quantity}
          </td>
          <td style="padding:10px;text-align:right;color:#fff;">
            £${(Number(item.price) * item.quantity).toFixed(2)}
          </td>
        </tr>
      `,
    )
    .join("");

  await sendMail({
    to: adminEmail,
    subject: `${brand} — New Order #${orderNumber}`,

    text: `A new order has been received.

Order: #${orderNumber}
Customer: ${customer?.name || "Customer"}
Email: ${customer?.email || "Unavailable"}
Total: £${Number(order.totalAmount).toFixed(2)}
Payment: ${order.paymentMethod}
Status: ${order.status}

Please review this order in your admin dashboard.`,

    html: wrap(`
      <h2 style="color:#f59e0b;">New Order Received!</h2>

      <p>A customer has placed a new order.</p>

      <div style="background:#222;padding:20px;border-radius:8px;">
        <p><strong>Order:</strong> #${orderNumber}</p>
        <p><strong>Customer:</strong> ${escapeHtml(customer?.name || "Customer")}</p>
        <p><strong>Email:</strong> ${escapeHtml(customer?.email || "Unavailable")}</p>
        <p><strong>Total:</strong> £${Number(order.totalAmount).toFixed(2)}</p>
        <p><strong>Payment:</strong> ${escapeHtml(order.paymentMethod)}</p>
        <p><strong>Status:</strong> ${escapeHtml(order.status)}</p>
      </div>

      <h3>Order Items</h3>

      <table style="width:100%;border-collapse:collapse;">
        ${itemsHtml}
      </table>

      <p><strong>Delivery Address:</strong></p>
      <p>
        ${escapeHtml(order.address?.street || "")},
        ${escapeHtml(order.address?.city || "")},
        ${escapeHtml(order.address?.zip || "")}
      </p>

      <p>Please review this order in your admin dashboard.</p>
    `),
  });

  console.log("✅ Admin order notification sent:", adminEmail);
};



exports.sendAdminReservationNotification = async (reservation, table) => {
  const adminEmail = await getAdminEmail();
  console.log("📨 Sending reservation notification to admin:", adminEmail);

  const customerName =
    `${reservation.firstName || ""} ${reservation.lastName || ""}`.trim();

  const tableNumber = table?.tableNumber || "Not assigned";

  await sendMail({
    to: adminEmail,
    subject: `${brand} — New Reservation Received`,
    text: `A new reservation has been received.

Customer: ${customerName}
Email: ${reservation.email}
Phone: ${reservation.phone}
Date: ${reservation.date}
Time: ${reservation.time}
Guests: ${reservation.guests}
Table: ${tableNumber}
Status: ${reservation.status}`,

    html: wrap(`
      <h2 style="color:#f59e0b;">New Reservation</h2>
      <p>A customer has submitted a new reservation request.</p>

      <div style="background:#222;padding:20px;border-radius:8px;">
        <p><strong>Customer:</strong> ${escapeHtml(customerName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(reservation.email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(reservation.phone)}</p>
        <p><strong>Date:</strong> ${escapeHtml(reservation.date)}</p>
        <p><strong>Time:</strong> ${escapeHtml(reservation.time)}</p>
        <p><strong>Guests:</strong> ${reservation.guests}</p>
        <p><strong>Table:</strong> ${escapeHtml(tableNumber)}</p>
        <p><strong>Status:</strong> Pending</p>
        <p><strong>Occasion:</strong> ${escapeHtml(reservation.occasion || "Not specified")}</p>
        <p><strong>Special requests:</strong> ${escapeHtml(reservation.specialRequests || "None")}</p>
      </div>

      <p>Please review this reservation in your admin dashboard.</p>
    `),
  });
};


// Initial booking request: pending approval
exports.sendReservationEmail = async (reservation, table) => {
  const name =
    `${reservation.firstName || ""} ${reservation.lastName || ""}`.trim();
  const tableNumber = table?.tableNumber || "To be assigned";

  await sendMail({
    to: reservation.email,
    subject: `${brand} — Reservation Received`,
    text: `Hi ${name},

We have received your reservation request.

Date: ${reservation.date}
Time: ${reservation.time}
Guests: ${reservation.guests}
Table: ${tableNumber}

Your reservation is currently pending confirmation. We will notify you once it has been reviewed.

Thank you for choosing ${brand}.`,

    html: wrap(`
      <h2 style="color:#f59e0b;">Reservation Received!</h2>
      <p>Hi ${escapeHtml(name)},</p>
      <p>Thank you for choosing ${brand}. We have received your reservation request.</p>

      <div style="background:#222;padding:20px;border-radius:8px;margin:20px 0;">
        <p><strong>Date:</strong> ${escapeHtml(reservation.date)}</p>
        <p><strong>Time:</strong> ${escapeHtml(reservation.time)}</p>
        <p><strong>Guests:</strong> ${reservation.guests}</p>
        <p><strong>Table:</strong> ${escapeHtml(tableNumber)}</p>
        <p><strong>Status:</strong>
          <span style="color:#f59e0b;">Pending Confirmation</span>
        </p>
      </div>

      <p style="color:#aaa;">Our team will review your request and notify you of the final decision.</p>
    `),
  });
};

// Admin decision: confirmed or rejected
exports.sendReservationStatusEmail = async (reservation) => {
  const name =
    `${reservation.firstName || ""} ${reservation.lastName || ""}`.trim();
  const isConfirmed = reservation.status === "confirmed";

  if (!["confirmed", "rejected"].includes(reservation.status)) {
    return;
  }

  const subject = isConfirmed
    ? "Your Reservation is Confirmed!"
    : "Your Reservation Request Update";

  const message = isConfirmed
    ? "Great news! Your reservation has been confirmed. We look forward to welcoming you."
    : "Unfortunately, we cannot accept your reservation request at this time. Please contact our restaurant if you need assistance.";

  const color = isConfirmed ? "#22c55e" : "#ef4444";

  await sendMail({
    to: reservation.email,
    subject: `${brand} — ${subject}`,
    text: `Hi ${name},

${message}

Date: ${reservation.date}
Time: ${reservation.time}
Guests: ${reservation.guests}
Table: ${reservation.table?.tableNumber || "Not assigned"}

Thank you,
${brand}`,

    html: wrap(`
      <h2 style="color:${color};">${subject}</h2>
      <p>Hi ${escapeHtml(name)},</p>
      <p>${message}</p>

      <div style="background:#222;padding:20px;border-radius:8px;margin:20px 0;">
        <p><strong>Date:</strong> ${escapeHtml(reservation.date)}</p>
        <p><strong>Time:</strong> ${escapeHtml(reservation.time)}</p>
        <p><strong>Guests:</strong> ${reservation.guests}</p>
        <p><strong>Table:</strong> ${escapeHtml(reservation.table?.tableNumber || "Not assigned")}</p>
        <p><strong>Status:</strong>
          <span style="color:${color};">${escapeHtml(reservation.status.toUpperCase())}</span>
        </p>
      </div>

      <p style="color:#aaa;">Thank you for choosing ${brand}.</p>
    `),
  });
};

exports.sendContactEmail = async () => {};
