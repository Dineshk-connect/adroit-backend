const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
require('dotenv').config();

const app = express();
app.use(cors({
  origin: "*",
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("MongoDB Connected"));

const EnquirySchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  message: String,
});

const Enquiry = mongoose.model('Enquiry', EnquirySchema);

app.post('/enquiry', async (req, res) => {
  const data = req.body;

  await Enquiry.create(data);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await resend.emails.send({
  from: 'Adroit Website <onboarding@resend.dev>',
  to: process.env.COMPANY_EMAIL,
  reply_to: data.email,
  subject: 'New Enquiry from Website',
  html: `
    <h2>New Website Enquiry</h2>
    <p><b>Name:</b> ${data.firstName} ${data.lastName}</p>
    <p><b>Email:</b> ${data.email}</p>
    <p><b>Phone:</b> ${data.phone}</p>
    <p><b>Message:</b></p>
    <p>${data.message}</p>
  `,
});



  res.json({ message: "Enquiry sent successfully" });

});

app.listen(5000, () => console.log("Server running on port 5000"));
