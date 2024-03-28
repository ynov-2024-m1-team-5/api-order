const brevo = require('@getbrevo/brevo');

const sendMail = (params) => {
  const { receiver_email, receiver_name, subject, content, sender_name,  } = params;
  let defaultClient = brevo.ApiClient.instance;

  let apiKey = defaultClient.authentications['api-key'];
  apiKey.apiKey = `xkeysib-${process.env.API_KEY}`;

  let apiInstance = new brevo.TransactionalEmailsApi();
  let sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.subject = `${subject}`;
  sendSmtpEmail.htmlContent = `<html><body><h1></h1>${content}</body></html>`;
  sendSmtpEmail.sender = { "name": `${sender_name}`, "email": "ami95190@gmail.com" };
  sendSmtpEmail.to = [
    { "email": `${receiver_email}`, "name": `${receiver_name}` }
  ];
  sendSmtpEmail.replyTo = { "email": "example@brevo.com", "name": "sample-name" };
  sendSmtpEmail.headers = { "Some-Custom-Name": "unique-id-1234" };
  sendSmtpEmail.params = { "parameter": "My param value", "subject": "common subject" };


  apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
    console.log('API called successfully. Returned data: ' + JSON.stringify(data));
  }, function (error) {
    console.error(error);
  });

}
module.exports = sendMail;