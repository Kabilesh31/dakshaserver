const nodeMailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodeMailer.createTransport({
    service: "gmail",
    auth: {
      user: "tnpscupdatesofficial@gmail.com",
      pass: "zpedhlrwabpsjhpl",
    },
  });
  const mailOptions = {
    from: "tnpscupdatesofficial@gmail.com",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
