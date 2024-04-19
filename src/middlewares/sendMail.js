const brevo = require('@getbrevo/brevo');
require('dotenv').config();

const sendMail = (receiver_email, receiver_name, subject, content, sender_name) => {

  let apiInstance = new brevo.TransactionalEmailsApi();

  let apiKey = apiInstance.authentications['apiKey'];
  apiKey.apiKey = process.env.API_KEY;
  
  let sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.subject = `${subject}`;
  sendSmtpEmail.htmlContent = `<html><body><h1>${subject}</h1>${content}</body></html>`;
  sendSmtpEmail.sender = { "name": `${sender_name}`, "email": "ynov.team5@gmail.com" };
  sendSmtpEmail.to = [
    { "email": `${receiver_email}`, "name": `${receiver_name}` }
  ];
  sendSmtpEmail.replyTo =  { "email": `${receiver_email}`, "name": `${receiver_name}` };
  sendSmtpEmail.headers = { "Some-Custom-Name": "unique-id-1234" };
  sendSmtpEmail.params = { "parameter": "My param value", "subject": "common subject" };


  apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
    return {
      success: true,
      data
    }
  }, function (error) {
      return {
        success: false,
        data: error
      }
  });

}
module.exports = sendMail;