const dialogflow = require('@google-cloud/dialogflow');
const nodemailer = require('nodemailer');
const { WebhookClient, Suggestion } = require('dialogflow-fulfillment');
const express = require("express")
require('dotenv').config();
const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
const authToken = process.env.TWILIO_AUTH_TOKEN || '';
const client = require('twilio')(accountSid, authToken);

const cors = require("cors"); 


const app = express();
app.use(express.json())
app.use(cors());


// ✅ Setup email transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});



const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.post("/webhook", async (req, res) => {
  var id = (res.req.body.session).substr(43);
  console.log(id)
  const agent = new WebhookClient({ request: req, response: res });

  function hi(agent) {
    console.log(`intent  =>  hi`);
    agent.add("hello from server")
  }



  // ...existing code...
  async function emailsender(agent) {
      const { name, email, phone } = agent.parameters;
      const emailMessage = `Hello ${name.name}, I will send an email to ${email} and a WhatsApp message to ${phone}.`;
      agent.add(emailMessage);
    
      try {
        const info = await transporter.sendMail({
          from: 'fahad memon <fahadmemon956@gmail.com>', // sender address
          to: email,
          subject: "Hello ✔",
          text: emailMessage,
        });
        console.log("Email sent:", info.messageId);
    
        const message = await client.messages.create({
          from: 'whatsapp:+14155238886',
          body: `Hello ${name.name}, thanks for connecting. We have sent an email to ${email}. If you have any questions, feel free to reach out!`,
          to: `whatsapp:+923300233331`
        });
        console.log("WhatsApp sent:", message.sid);
    
      } catch (error) {
        console.error("Error in email or WhatsApp:", error);
        agent.add("There was an error sending your message. Please try again later.");
      }
    }

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', hi);
  intentMap.set('EMAIL TEST', emailsender);
  agent.handleRequest(intentMap);
})
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});