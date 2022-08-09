export default class Mailer {
  static sendConfirmation(email: string, token: string) {
    const msg = `url: ${process.env.CONFIRMATION_URL}${token}, email: ${email}`;
    console.log('msg', msg)
    return this.send(msg);
  }
  static forgotPassword(email: string, token: string) {
    const msg = `url: ${process.env.FORGOT_PASSWORD_URL}${token}, email: ${email}`;
    return this.send(msg);
  }

  static send(msg: string): boolean {
    console.log(msg);
    return true;
  }
}
