const nodemailer = require("nodemailer");

const SendEmail = async (receiver, subject, htmlContent) => {
    try {
        // Initialize nodemailer
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.EMAIL_ID,
                pass: process.env.EAMIL_APP_PASSWORD
            }
        });

        const mailOptions = {
            from: "Software support <no-reply@ariprodesign.com>",
            to: receiver,
            subject: subject,
            html: htmlContent
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);

        console.log("Email sent:", info.messageId);
        return { success: true, message: "Email sent successfully!" };
    } catch (exc) {
        console.log("Error sending email:", exc.message);
        return { success: false, message: "Service unavailabe: Error sending email!" };
    }
}


module.exports = {
    SendEmail
};