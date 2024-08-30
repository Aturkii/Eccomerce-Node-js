import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

//~ Sending Email function 
export const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Shoppieee" <${process.env.EMAIL_USERNAME}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    return new Error('Error sending email:', error);
  }
};