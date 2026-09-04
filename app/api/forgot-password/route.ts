import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { randomBytes } from "node:crypto";

const RESET_TTL_HOURS = 1;

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      // Returnera success ändå för att inte avslöja om e-post finns eller inte
      return Response.json({ success: true });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const resendKey = process.env.RESEND_API_KEY;

    if (!supabaseUrl || !supabaseKey || !resendKey) {
      console.error("forgot-password: env saknas");
      return Response.json({ success: true });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const cleanEmail = email.trim().toLowerCase();

    const { data: user } = await supabase
      .from("users")
      .select("id, name, email")
      .eq("email", cleanEmail)
      .maybeSingle();

    // Returnera alltid success för att inte avslöja vilka e-postadresser som finns
    if (!user) {
      return Response.json({ success: true });
    }

    const token = generateToken();
    const expires = new Date(Date.now() + RESET_TTL_HOURS * 60 * 60 * 1000);

    const { error: updateError } = await supabase
      .from("users")
      .update({
        password_reset_token: token,
        password_reset_expires: expires.toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("forgot-password update error:", updateError);
      return Response.json({ success: true });
    }

    const baseUrl =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "https://tidsapp.vercel.app";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    const resend = new Resend(resendKey);
    const { error: emailError } = await resend.emails.send({
      from: "Tidsapp <onboarding@resend.dev>",
      to: cleanEmail,
      subject: "\u00c5terst\u00e4ll ditt l\u00f6senord",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Tidsapp</h2>
          <p>Hej${user.name ? " " + user.name : ""},</p>
          <p>Vi har f&aring;tt en beg&auml;ran om att &aring;terst&auml;lla l&ouml;senordet f&ouml;r ditt Tidsapp-konto.</p>
          <p>Klicka p&aring; knappen nedan f&ouml;r att v&auml;lja ett nytt l&ouml;senord. L&auml;nken g&auml;ller i ${RESET_TTL_HOURS} timme.</p>
          <p style="margin: 24px 0;">
            <a href="${resetUrl}" style="background: #2563eb; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 500; display: inline-block;">
              V&auml;lj nytt l&ouml;senord
            </a>
          </p>
          <p style="color: #6b7280; font-size: 13px;">
            Fungerar inte knappen? Kopiera och klistra in denna l&auml;nk i webbl&auml;saren:<br/>
            <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
          </p>
          <p style="color: #6b7280; font-size: 13px;">
            Har du inte beg&auml;rt detta kan du strunta i mailet &mdash; ingenting har &auml;ndrats.
          </p>
          <p style="color: #6b7280;">Med v&auml;nliga h&auml;lsningar,<br/>Tidsapp</p>
        </div>
      `,
    });

    if (emailError) {
      console.error("forgot-password Resend error:", emailError);
      // Returnera ändå success för att inte avslöja något
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("forgot-password error:", error);
    return Response.json({ success: true });
  }
}
