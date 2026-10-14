import nodemailer from 'nodemailer';
import logger from './logger.js';

/**
 * Email Service
 * Handle all email notifications
 */

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialize();
  }

  initialize() {
    // Skip email setup if SMTP not configured (development)
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      logger.warn('Email service not configured - emails will be logged only');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      logger.info('Email service initialized');
    } catch (error) {
      logger.error('Failed to initialize email service', { error: error.message });
    }
  }

  async sendEmail({ to, subject, text, html }) {
    try {
      if (!this.transporter) {
        logger.info('Email would be sent:', { to, subject });
        return { success: false, message: 'Email service not configured' };
      }

      const mailOptions = {
        from: `${process.env.APP_NAME} <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info('Email sent successfully', { to, subject, messageId: info.messageId });
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Failed to send email', { to, subject, error: error.message });
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(user) {
    const subject = `Welcome to ${process.env.APP_NAME}!`;
    const text = `Hi ${user.name},\n\nWelcome to ${process.env.APP_NAME}! Your account has been created successfully.\n\nBest regards,\nThe ${process.env.APP_NAME} Team`;
    const html = `
      <h2>Welcome to ${process.env.APP_NAME}!</h2>
      <p>Hi ${user.name},</p>
      <p>Your account has been created successfully. We're excited to have you on board!</p>
      <p>Best regards,<br>The ${process.env.APP_NAME} Team</p>
    `;

    return this.sendEmail({ to: user.email, subject, text, html });
  }

  async sendBookingRequestEmail(booking, talent, brand) {
    const subject = `New Booking Request from ${brand.name}`;
    const text = `You have a new booking request from ${brand.name}. Please log in to review the details.`;
    const html = `
      <h2>New Booking Request</h2>
      <p>You have received a new booking request from <strong>${brand.name}</strong>.</p>
      <p><strong>Project:</strong> ${booking.projectType}</p>
      <p>Please log in to your dashboard to review the details.</p>
    `;

    return this.sendEmail({ to: talent.email, subject, text, html });
  }

  async sendApprovalEmail(booking, user, contactDetails) {
    const subject = 'Booking Request Approved!';
    const text = `Your booking request has been approved. Contact details: ${contactDetails}`;
    const html = `
      <h2>Booking Request Approved!</h2>
      <p>Great news! Your booking request has been approved by our admin team.</p>
      <p><strong>Contact Details:</strong></p>
      <ul>
        <li>Phone: ${contactDetails.phone}</li>
        <li>Email: ${contactDetails.email}</li>
      </ul>
      <p>You can now proceed with your project.</p>
    `;

    return this.sendEmail({ to: user.email, subject, text, html });
  }

  async sendRejectionEmail(booking, user) {
    const subject = 'Booking Request Update';
    const text = 'Your booking request has been reviewed. Please check your dashboard for details.';
    const html = `
      <h2>Booking Request Update</h2>
      <p>Thank you for your interest. After review, we are unable to proceed with this booking request at this time.</p>
      <p>Please feel free to submit a new request or contact support if you have questions.</p>
    `;

    return this.sendEmail({ to: user.email, subject, text, html });
  }
}

const emailService = new EmailService();

export default emailService;
