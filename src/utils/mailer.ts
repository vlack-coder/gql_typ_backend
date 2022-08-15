import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default class Mailer {
  static async sendConfirmation(
    email: string,
    token: string
  ): Promise<boolean> {
    // const msg = `url: ${process.env.CONFIRMATION_URL}${token}, email: ${email}`;
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL,
      templateId: process.env.SENDGRID_CONFIRM_TEMPLATE_ID,
      dynamicTemplateData: { confirm_token: token },
    };

    console.log("msg", msg);
    return await this.send(msg);
  }
  static async sendForgotPassword(email: string, token: string) {
    // const msg = `url: ${process.env.FORGOT_PASSWORD_URL}${token},
    // email: ${email}`;
    const body = 'This is a test email using SendGrid from Node.js';
    const msg = { 
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL,
      // subject: "Test email with Node.js and SendGrid",
      // text: body,
      // html: `<strong>${body}</strong>`,
      templateId: process.env.SENDGRID_PASSWORD_TEMPLATE_ID,
      dynamicTemplateData: { access_token: token },
    };
    console.log("msg", msg);
    return await this.send(msg);
  }

  static async send(msg: any): Promise<boolean> {
    // console.log(msg);
    // return true;
    try {
      const sent = await sgMail.send(msg);
      console.log("sent", sent);
      return true;
    } catch (error) {
    console.log("checkin froip ", process.env.SENDGRID_API_KEY);
    console.log("error.message", error.message);
      console.log("error.body", error.body);
      console.log("error", error);
      return false;
    }
  }
}
