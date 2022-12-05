import nodemailer from "nodemailer";

export const sendMail = async (mailOptions: any) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "mahesh.bhadane@torinit.ca",
      pass: "epfvhckxsokfahvp",
    },
  });

  await new Promise((resolve, reject) => {
    // send mail
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        console.log("Email sent: " + info.response);
        resolve(info);
      }
    });
  });
};
