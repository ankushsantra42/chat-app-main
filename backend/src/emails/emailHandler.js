// import { resendClient, sender } from "../lib/resend.js";
// import { createWelcomeEmailTemplate } from "../emails/emailTemplate.js";
const { resendClient, sender } = require("../lib/resend");
const { createWelcomeEmailTemplate } = require("../emails/emailTemplate");


const sendWelcomeEmail = async (email, name, clientURL) => {
  const { data, error } = await resendClient.emails.send({
    from: `${sender.name} <${sender.email}>`,
    to: email,
    subject: "Welcome to ChatApp!",
    html: createWelcomeEmailTemplate(name, clientURL),
  });

  if (error) {
    console.error("Error sending welcome email:", error);
    throw new Error("Failed to send welcome email");
  }

  console.log("Welcome Email sent successfully", data);
};

module.exports = { sendWelcomeEmail }   