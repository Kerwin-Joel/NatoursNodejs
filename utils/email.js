const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
    constructor(user,url){
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `KERWIN JOEL <${process.env.EMAIL_FROM_ADDRESS}>`;
    }
    newTransport(){
        if(process.env.NODE_ENV === 'production'){
            // Sendgrid
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
        }
        return nodemailer.createTransport({
                host:process.env.EMAIL_HOST,
                port:process.env.EMAIL_PORT,
                auth:{
                    user:process.env.EMAIL_USERNAME,
                    pass:process.env.EMAIL_PASSWORD,
                }
        })
    }
    //SEND THE ACTUAL EMAIL
    async send(template,subject){
        // 1) Render the HTML bases on a pug template
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`,{
            firstName:this.firstName,
            url:this.url,
            subject
        })
        // 2) Define email options
        const mailOptions = {
            from    :this.from,
            to      :this.to,
            subject ,
            html    ,
            text    :htmlToText.fromString(html),
        }
        // 3) Create a transport and send email
        await this.newTransport().sendMail(mailOptions)
    }
    //SEND EMAIL OF WELCOME
    async sendWelcome(){
        await this.send('welcome','Welcome to the Natours Family');
    }
    //SEND PASSWORD RESET
    async sendPasswordReset(){
        await this.send('passwordReset','Your password reset token (valid for only 10 minutes)');
    }
}









/* const sentEmail = async(options)=>{

    //1) Created a transporter
    const transporter = nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        auth:{
            user:process.env.EMAIL_USERNAME,
            pass:process.env.EMAIL_PASSWORD,
        }
    })
    //2) Define the email options
    const mailOptions = {
        from    :`Kerwin Joel <${process.env.EMAIL_FROM}>`,
        to      :options.email,
        subject :options.subject,
        text    :options.message,

    }
    //3) Send the email
    await transporter.sendMail(mailOptions)
} */