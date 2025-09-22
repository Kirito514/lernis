import nodemailer from 'nodemailer';

// Mock email service - in production, use a real email service like SendGrid or AWS SES
export async function sendOTPEmail(email: string, otp: string): Promise<void> {
  try {
    // In production, you would:
    // 1. Configure nodemailer with your SMTP settings
    // 2. Send the OTP email
    
    // For now, we'll just log the OTP
    console.log('Mock OTP email sent:', {
      to: email,
      otp,
      message: 'Your EduNFT wallet export OTP is: ' + otp,
    });
    
    // If you want to test with a real SMTP server, uncomment the following:
    /*
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'EduNFT Wallet Export OTP',
      html: `
        <h2>EduNFT Wallet Export</h2>
        <p>Your OTP for wallet export is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
        <p><strong>Security Warning:</strong> Never share your private key with anyone. EduNFT will never ask for your private key.</p>
      `,
    });
    */
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
}

export async function sendWelcomeEmail(email: string, username: string): Promise<void> {
  try {
    console.log('Mock welcome email sent:', {
      to: email,
      username,
      message: `Welcome to EduNFT, ${username}!`,
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
}

export async function sendCertificateIssuedEmail(
  email: string,
  studentName: string,
  courseName: string,
  certificateUrl: string
): Promise<void> {
  try {
    console.log('Mock certificate issued email sent:', {
      to: email,
      studentName,
      courseName,
      certificateUrl,
    });
  } catch (error) {
    console.error('Error sending certificate issued email:', error);
    throw new Error('Failed to send certificate issued email');
  }
}
