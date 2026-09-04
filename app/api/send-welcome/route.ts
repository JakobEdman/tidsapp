import { Resend } from "resend";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!email) {
      return Response.json(
        { error: "E-postadress krävs." },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY not set");
      return Response.json(
        { error: "E-posttjänsten är inte konfigurerad." },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);
    const isAdminCreated = !!password;
    const greeting = name ? `Hej ${name},` : "Hej,";

    const credentialsBlock = isAdminCreated
      ? `
          <p>Här är dina inloggningsuppgifter:</p>
          <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Användare:</strong> ${email}</p>
            <p style="margin: 4px 0;"><strong>Tillf&auml;lligt l&ouml;senord:</strong> ${password}</p>
          </div>
          <p>Vid f&ouml;rsta inloggningen blir du ombedd att v&auml;lja ett eget l&ouml;senord.</p>
        `
      : `
          <p>Ditt konto är skapat och du är redan inloggad. Du kan när som helst logga in igen på samma sätt med din e-post och ditt valda l&ouml;senord.</p>
        `;

    const subject = isAdminCreated
      ? "Ditt Tidsapp-konto har skapats"
      : "Välkommen till Tidsappen";

    const { error } = await resend.emails.send({
      from: "Tidsapp <onboarding@resend.dev>",
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 20px; color: #111827;">
          <div style="text-align: center; margin-bottom: 8px;">
            <span style="display: inline-block; background: #fef3c7; color: #92400e; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px;">Beta</span>
          </div>
          <h2 style="color: #2563eb; margin-top: 4px; text-align: center;">V&auml;lkommen till Tidsappen</h2>

          <p>${greeting}</p>
          <p>Roligt att du vill testa Tidsappen — en r&ouml;ststyrd app f&ouml;r tidsredovisning. Appen &auml;r just nu i <strong>betafas</strong> och vi finslipar den l&ouml;pande utifr&aring;n er feedback.</p>

          ${credentialsBlock}

          <h3 style="color: #111827; margin-top: 24px; font-size: 16px;">Kom ig&aring;ng</h3>
          <p>L&auml;ttast anv&auml;nder du appen p&aring; din mobil. P&aring; iPhone:</p>
          <ol style="padding-left: 20px;">
            <li>&Ouml;ppna <a href="https://tidsapp.vercel.app" style="color: #2563eb;">tidsapp.vercel.app</a> i Safari.</li>
            <li>Tryck p&aring; dela-knappen l&auml;ngst ner i mitten.</li>
            <li>V&auml;lj &quot;L&auml;gg till p&aring; hemsk&auml;rm&quot;.</li>
          </ol>
          <p>D&aring; f&aring;r du en egen ikon p&aring; telefonen som k&auml;nns som en vanlig app. Appen fungerar lika bra i webbl&auml;saren p&aring; datorn.</p>

          <h3 style="color: #111827; margin-top: 24px; font-size: 16px;">Vi vill h&ouml;ra fr&aring;n dig</h3>
          <p>I appen finns en knapp &quot;L&auml;mna feedback&quot; l&auml;ngst ner p&aring; startsidan. Skicka g&auml;rna &ouml;nskem&aring;l, tankar eller felrapporter — vi l&auml;ser allt och &aring;terkommer.</p>

          <p style="margin-top: 24px;">
            <a href="https://tidsapp.vercel.app" style="background: #2563eb; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 500; display: inline-block;">
              &Ouml;ppna Tidsappen
            </a>
          </p>

          <p style="color: #6b7280; font-size: 12px; margin-top: 32px;">
            Med v&auml;nliga h&auml;lsningar,<br/>Tidsapp
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return Response.json(
        { error: "Kunde inte skicka e-post." },
        { status: 500 }
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Send welcome error:", error);
    return Response.json(
      { error: "Kunde inte skicka e-post." },
      { status: 500 }
    );
  }
}
