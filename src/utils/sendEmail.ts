import nodemailer from "nodemailer";

export const sendMail = (mailOptions: any) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "mahesh.bhadane@torinit.ca",
      pass: "epfvhckxsokfahvp",
    },
  });

  transporter.sendMail(mailOptions, function (error: any, info: any) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};