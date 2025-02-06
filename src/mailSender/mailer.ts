import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});

type Mail = {
    to: string,
    subject: string,
    text: string,
    html: string,
    from: string
}

// async..await is not allowed in global scope, must use a wrapper
async function mail({ to, subject, text, html, from }: Mail) {
    console.log("starting")
    // console.log(process.env.EMAIL)
    // console.log(process.env.PASSWORD)
    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: from, // sender address
        to: to,
        subject: subject,
        text: text,
        html: html,
    });

    console.log("Message sent: %s", info.messageId);
    return info.messageId
}


export default mail
