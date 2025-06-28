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

    
    

    function emailsender(agent) {
        const { name , email , number} = agent.parameters;
        agent.add(`Hello ${name.name}, I will send an email to ${email} and a WhatsApp message to ${number}`);
        (async () => {
            try {
              const info = await transporter.sendMail({
                from: '"fahad Memon" <fahadmemon956@gmail.com>',
                to: email,
                subject: "Hello ✔",
                text:`Hello ${name.name}, I will send an email to ${email}`, // plain‑text body
              });
              console.log("Message sent:", info.messageId);
            } catch (error) {
              console.error("Error sending email:", error);
            }
        })();

   client.messages
    .create({
                from: 'whatsapp:+14155238886',
        contentSid: 'HXb5b62575e6e4ff6129ad7c8efe1f983e',
      body: `Hello ${name.name}, I will send an email to ${email} and a WhatsApp message to ${number}`,
        to: 'whatsapp:+923300233331'
    })
    .then(message => console.log(message.sid))

    }

    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', hi); 
    intentMap.set('EMAIL TEST', emailsender);
    agent.handleRequest(intentMap);
})
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});