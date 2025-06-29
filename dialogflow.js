const dialogflow = require('@google-cloud/dialogflow');
const nodemailer = require('nodemailer');
const { WebhookClient, Suggestion } = require('dialogflow-fulfillment');
const express = require("express")
require('dotenv').config();
const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
const authToken = process.env.TWILIO_AUTH_TOKEN || '';
const client = require('twilio')(accountSid, authToken);
const runGeminiChat = require('./services/gemini');

const cors = require("cors");


const app = express();
app.use(express.json())
app.use(cors());

function randomnumbgn() {
  //generate 6 digit random number
  return Math.floor(Math.random() * 900000) + 100000;
}

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
    agent.add("Assalam-o-Alaikum! I'm Saylani's AI assistant. How can I help you today?");
  }
  // ...existing code...
  async function emailsender(agent) {
    const { studentname, coursename, fathername, cnic , email , phone } = agent.parameters;
    const emailMessage = `Thank you, ${studentname.name}  ${fathername} ${cnic} . Your registration for  ${coursename} is complete ✅  Confirmation will be sent to:
    email: ${email}
    WhatsApp number ${phone} cnic: 
    ` ;
    agent.add(emailMessage);

    try {
      const info = await transporter.sendMail({
        from: 'SMIT <fahadmemon956@gmail.com>', // sender address
        to: email,
        subject: "REGISTRATION SUCCESSFULL", // Subject line
             // text: "Hello world?", // plain‑text body
          html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SMIT ID Card</title>
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #fff;">

  <!-- ID Card Container -->
  <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; border-bottom: 1px dashed #000; padding-bottom: 20px;">

    <!-- Front Side -->
    <div style="width: 300px; border: 1px solid #ccc; padding: 15px; box-sizing: border-box;">
      <div style="text-align: center;">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnx-xUnYll7mKYaNq8vYKEfALa3WmAJWsTuwXM9jtwO2SSRTqFkCfGhiSATEmj22L5b70&usqp=CAU" alt="SMIT Logo" style="height: 40px; margin-bottom: 10px;">
        <h3 style="color: #0072CE; margin: 0;">SAYLANI MASS IT<br>TRAINING PROGRAM</h3>
        <div style="margin: 10px 0;">
         <img src="https://media-mct1-1.cdn.whatsapp.net/v/t61.24694-24/455688887_457597333948537_3289090598300960900_n.jpg?ccb=11-4&oh=01_Q5Aa1wEXQpRW_PjwbjMkwAfL8_hN90FgJ4_PieIGpn2SYOK3yw&oe=686ED446&_nc_sid=5e03e0&_nc_cat=106" alt="Profile Picture" style="width: 80px; height: 80px; border-radius: 50%;">
        </div>
        <h4 style="margin: 5px 0;">${studentname.name}</h4>
        <p style="margin: 0;">${coursename} </p>
        <p style="margin: 5px 0; font-weight: bold;">GD-${randomnumbgn()}</p>
      </div>
    </div>

    <!-- Back Side -->
    <div style="width: 300px; border: 1px solid #ccc; padding: 15px; box-sizing: border-box;">
      <p style="margin: 5px 0;"><strong>Name:</strong> ${studentname.name}</p>
      <p style="margin: 5px 0;"><strong>Father name:</strong> ${fathername}</p>
      <p style="margin: 5px 0;"><strong>CNIC:</strong> ${cnic}</p>
      <p style="margin: 5px 0;"><strong>Course:</strong> ${coursename} </p>
      <div style="text-align: center; margin: 10px 0;">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStrccmmalpPtI4sX78k6OXyFkA3-mw6mXJ_A&s" alt="QR Code" style="width: 100px; height: 100px;">
      </div>
      <p style="font-size: 12px; color: #444; text-align: center;">Note: This card is for SMIT’s premises only. If found please return to SMIT.</p>
      <p style="text-align: center; font-weight: bold; margin-top: 15px;">Issuing authority</p>
    </div>

  </div>

  <!-- Instructions -->
  <div style="padding: 15px;">
    <h3 style="color: red;">Instructions:</h3>
    <ol>
      <li>Please make colour print of this Admit/ID card</li>
      <li>Please like & follow this page: 
        <a href="https://www.facebook.com/SaylaniMassTraining" style="color: #0072CE;">https://www.facebook.com/SaylaniMassTraining</a>
      </li>
      <li>Please join this group:
        <a href="https://www.facebook.com/groups/SaylaniSG" style="color: #0072CE;">https://www.facebook.com/groups/SaylaniSG</a>
      </li>
    </ol>
  </div>

  <!-- Footer -->
  <!-- <div style="text-align: center; padding: 15px 0; border-top: 1px solid #ccc;">
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Saylani_Welfare_Logo.png/800px-Saylani_Welfare_Logo.png" alt="Saylani Logo" style="height: 40px;">
    <p style="margin: 5px 0;">Donate Us:</p>
    <a href="https://www.saylaniwelfare.com" style="color: #0072CE;">https://www.saylaniwelfare.com</a>
  </div> -->

</body>
</html>

`, // HTML body
      });
      console.log("Email sent:", info.messageId);

      const message = await client.messages.create({
        from: 'whatsapp:+14155238886',
        body:  `Thank you, ${studentname.name}  ${fathername} ${cnic} . Your registration for  ${coursename} is complete ✅  Confirmation will be sent to:
    email: ${email}
    WhatsApp number ${phone} cnic: 
    ` ,
        to: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER || phone}`,
      });
      console.log("WhatsApp sent:", message.sid);

    } catch (error) {
      console.error("Error in email or WhatsApp:", error);
      agent.add("There was an error sending your message. Please try again later.");
    }
  }


  async function fallback(agent) {
    try {
      const action = req.body.queryResult.action;
      const queryText = req.body.queryResult.queryText;

      if (action === 'input.unknown') {
        const response = await runGeminiChat(queryText);
        agent.add(response);
        console.log("Gemini:", response);
      } else {
        agent.add("Sorry, I couldn't understand. Please rephrase.");
      }
    } catch (err) {
      console.error("Fallback error:", err);
      agent.add("There was a problem getting a response. Please try again.");
    }
  }

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', hi);
  intentMap.set('registeration', emailsender);
  intentMap.set('Default Fallback Intent', fallback);
  agent.handleRequest(intentMap);
})
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});