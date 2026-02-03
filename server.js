require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { Resend } = require("resend");

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors({
  origin: "https://adroit-website-five.vercel.app",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const EnquirySchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  message: String,
});

const Enquiry = mongoose.model("Enquiry", EnquirySchema);

app.post("/enquiry", async (req, res) => {
  try {
    const data = req.body;

    await Enquiry.create(data);

    await resend.emails.send({
      from: "Adroit Website <onboarding@resend.dev>",
      to: process.env.COMPANY_EMAIL,
      reply_to: data.email,
      subject: "New Enquiry from Website",
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
console.log("Resend key:", process.env.RESEND_API_KEY);

