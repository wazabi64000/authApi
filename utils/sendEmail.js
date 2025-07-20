import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const MAILTRAP_USER = process.env.MAILTRAP_USER; // ex: '1234567890abcdef'
const MAILTRAP_PASS = process.env.MAILTRAP_PASS; // ex: 'abcdef1234567890'

const transporter = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: MAILTRAP_USER,
    pass: MAILTRAP_PASS,
  },
});

/**
 * Envoie un email simple via Mailtrap
 * @param {Object} options - Options email
 * @param {string} options.to - Destinataire
 * @param {string} options.subject - Sujet
 * @param {string} options.html - Contenu HTML
 */
async function sendEmail({ to, subject, html }) {
  try {
    const mailOptions = {
      from: '"Mon App" <no-reply@monapp.com>', // expéditeur
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé:', info.messageId);
  } catch (error) {
    console.error('Erreur envoi email:', error);
    throw new Error('Erreur lors de l’envoi de l’email');
  }
}

export default sendEmail;
