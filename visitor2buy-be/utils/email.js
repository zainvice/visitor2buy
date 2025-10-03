const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production email configuration
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    // Development - use ethereal email for testing
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    });
  }
};

// Send email function
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@visitor2buy.com',
      to,
      subject,
      text,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent:', info.messageId);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// Send bulk emails
const sendBulkEmail = async (emails) => {
  try {
    const transporter = createTransporter();
    const results = [];

    for (const email of emails) {
      try {
        const info = await transporter.sendMail({
          from: process.env.EMAIL_USER || 'noreply@visitor2buy.com',
          ...email
        });
        results.push({ success: true, messageId: info.messageId, email: email.to });
      } catch (error) {
        results.push({ success: false, error: error.message, email: email.to });
      }
    }

    return results;
  } catch (error) {
    console.error('Bulk email sending error:', error);
    throw error;
  }
};

// Email templates
const emailTemplates = {
  welcome: (name) => ({
    subject: 'Welcome to Visitor2Buy!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to Visitor2Buy!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for joining Visitor2Buy. We're excited to help you convert more visitors into customers!</p>
        <p>Here's what you can do next:</p>
        <ul>
          <li>Create your first campaign</li>
          <li>Set up tracking on your website</li>
          <li>Monitor your analytics dashboard</li>
        </ul>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br>The Visitor2Buy Team</p>
      </div>
    `
  }),

  campaignAlert: (campaignName, metric, value) => ({
    subject: `Campaign Alert: ${campaignName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Campaign Alert</h1>
        <p>Your campaign <strong>${campaignName}</strong> has reached a milestone:</p>
        <p><strong>${metric}:</strong> ${value}</p>
        <p>Check your dashboard for more details and insights.</p>
        <p>Best regards,<br>The Visitor2Buy Team</p>
      </div>
    `
  }),

  passwordReset: (resetLink) => ({
    subject: 'Password Reset - Visitor2Buy',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Password Reset Request</h1>
        <p>You requested a password reset for your Visitor2Buy account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        </div>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>Best regards,<br>The Visitor2Buy Team</p>
      </div>
    `
  })
};

module.exports = {
  sendEmail,
  sendBulkEmail,
  emailTemplates
};