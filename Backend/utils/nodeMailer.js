import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS
  },
});

async function sendEmail({ to, subject, text }) {
  const mailOptions = {
    from: 'suryadevkumar786786@gmail.com',
    to,
    subject,
    text,
  };

  try {
    // Await transporter.sendMail
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return { success: true, response: info.response };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
}

export default sendEmail;
