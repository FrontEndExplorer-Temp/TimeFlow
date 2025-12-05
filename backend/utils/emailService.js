import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000, // 5 seconds
});

const getEmailTemplate = (title, content, buttonText, buttonUrl) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f6f8; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-top: 40px; margin-bottom: 40px; }
            .header { background-color: #2196F3; padding: 30px 20px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 40px 30px; }
            .button { display: inline-block; padding: 14px 28px; background-color: #2196F3; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; text-align: center; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; border-top: 1px solid #e9ecef; }
            .token-box { background-color: #e3f2fd; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 24px; letter-spacing: 2px; text-align: center; margin: 20px 0; color: #1976d2; font-weight: bold; border: 1px dashed #2196F3; word-break: break-all; overflow-wrap: break-word; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${title}</h1>
            </div>
            <div class="content">
                ${content}
                ${buttonText && buttonUrl ? `<div style="text-align: center;"><a href="${buttonUrl}" class="button">${buttonText}</a></div>` : ''}
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Life Management System. All rights reserved.</p>
                <p>This is an automated message, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

export const sendVerificationEmail = async (email, token) => {
    const verificationUrl = `http://localhost:5000/api/users/verify/${token}`;

    const content = `
        <p>Hello,</p>
        <p>Thank you for registering with Life Management System. To ensure the security of your account, please verify your email address by clicking the button below.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
    `;

    const html = getEmailTemplate(
        'Verify Your Email',
        content,
        'Verify Email Address',
        verificationUrl
    );

    const mailOptions = {
        from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
        to: email,
        subject: 'Verify your account - Life Management System',
        html: html,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent to:', email);
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Email could not be sent');
    }
};

export const sendPasswordResetEmail = async (email, token) => {
    const content = `
        <p>Hello,</p>
        <p>We received a request to reset the password for your account. Use the secure token below to reset your password in the app.</p>
        <div class="token-box">${token}</div>
        <p>This token will expire in 10 minutes.</p>
        <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
    `;

    const html = getEmailTemplate(
        'Password Reset Request',
        content,
        null,
        null
    );

    const mailOptions = {
        from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
        to: email,
        subject: 'Reset Your Password - Life Management System',
        html: html,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Password reset email sent to:', email);
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Email could not be sent');
    }
};