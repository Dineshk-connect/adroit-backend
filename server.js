const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors());
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

  await transporter.sendMail({
  from: `"Adroit Website Enquiry" <${process.env.EMAIL_USER}>`,
  to: process.env.EMAIL_USER,   // later change to company mail
  replyTo: data.email,        
  subject: "New Enquiry from Adroit Website",
  html: `
    <h2>New Website Enquiry</h2>
    <p><b>Name:</b> ${data.firstName} ${data.lastName}</p>
    <p><b>Email:</b> ${data.email}</p>
    <p><b>Phone:</b> ${data.phone}</p>
    <p><b>Message:</b></p>
    <p>${data.message}</p>
    <hr/>
    <p>This enquiry was submitted from the Adroit Staffing Solutions website.</p>
  `,
});


  res.json({ message: "Enquiry sent successfully" });

});

app.listen(5000, () => console.log("Server running on port 5000"));
