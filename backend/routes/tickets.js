const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// POST /api/tickets
router.post('/', async (req, res) => {
  try {
    const { name, department, severity, subject, message } = req.body;

    if (!name || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Name, subject, and message are required.' });
    }

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      console.warn('⚠️ SMTP credentials (EMAIL_USER, EMAIL_PASS) are missing in .env');
      console.warn('⚠️ Simulating successful ticket submission for testing...');
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return res.json({ success: true, message: 'Ticket submitted successfully! (Simulated - no email sent)' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const mailOptions = {
      from: emailUser,
      to: '23cs2033@rgipt.ac.in, anurag.asim2014@gmail.com',
      subject: `[JSW Support - ${severity || 'Normal'}] ${subject}`,
      text: `
You have received a new support ticket.

Name: ${name}
Department: ${department || 'N/A'}
Severity: ${severity || 'Normal'}

Subject: ${subject}
Message:
${message}
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Ticket email sent for subject: "${subject}"`);
    
    res.json({ success: true, message: 'Ticket submitted successfully!' });
  } catch (error) {
    console.error('Error sending ticket email:', error);
    res.status(500).json({ success: false, message: 'Failed to send ticket. Please try again later.' });
  }
});

module.exports = router;
