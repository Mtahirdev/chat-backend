import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const SendEmail = async (to, subject, text, html) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "My App <onboarding@resend.dev>",
      to: [to],
      subject,
      text,
      html,
    });

    if (error) {
      console.log("Email sending failed:", error);

      return {
        success: false,
        message: error.message,
      };
    }

    console.log("Email sent successfully:", data.id);

    return {
      success: true,
      messageId: data.id,
    };
  } catch (error) {
    console.log("Email error:", error.message);

    return {
      success: false,
      message: error.message,
    };
  }
};
