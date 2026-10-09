import { CONTACT_EMAIL, SITE_NAME, SITE_URL } from "@/lib/site";

/**
 * The acknowledgement a contact-form submitter receives.
 *
 * Written as an email, not a web page: tables for layout, every style inline,
 * no external stylesheet, no script, no web font. Clients strip <style> often
 * enough that nothing structural may depend on it; the one <style> block here
 * carries only the mobile overrides, so the desktop rendering stands alone if
 * it is discarded.
 *
 * All wording is live text. The two images are decorative, carry empty alt
 * text, and sit on a background that already matches them, so an inbox with
 * images disabled loses nothing but the artwork.
 */

const PURPOSE_PHRASES: Record<string, string> = {
  general: "general enquiry",
  service: "service enquiry",
  partnership: "partnership enquiry",
  media: "media enquiry",
  client: "enquiry as an existing client",
};

/**
 * Reads naturally in "We've received your ___." for every option the form
 * offers. "client" is the awkward one: "your existing-client enquiry" is
 * clumsy, so it becomes "your enquiry as an existing client".
 */
export function describeEnquiry(purpose: string): string {
  return PURPOSE_PHRASES[purpose] ?? "enquiry";
}

const VOID = "#000000";
const WHITE = "#ffffff";
const ASH = "#9a9a9a";
const MIST = "#bdbdbd";
const IRIS = "#a78bfa";
const CYAN = "#5cc8e8";
const FONT = "'Helvetica Neue', Helvetica, Arial, 'Segoe UI', Roboto, sans-serif";

export function contactAcknowledgementSubject(): string {
  return `We have received your enquiry | ${SITE_NAME}`;
}

export function contactAcknowledgementText(purpose: string): string {
  return [
    `${SITE_NAME}. A conversation begins.`,
    "",
    "YOUR MESSAGE IS WITH US.",
    "",
    "A small hello. A new possibility.",
    "",
    "Thank you for reaching out.",
    "",
    `We've received your ${describeEnquiry(purpose)}. We'll share your message with the right person on our team and get back to you within one business day.`,
    "",
    "We look forward to learning more about what you have in mind.",
    "",
    "1 business day. A reply from the right team.",
    "",
    "Speak soon,",
    `The ${SITE_NAME} team`,
    "",
    `Have something to add? ${CONTACT_EMAIL}`,
    "",
    "This is an automated confirmation. Replies to this email are not monitored.",
    "",
    "AI-powered. Human-led.",
    "Better connections. New possibilities.",
    "",
    `${SITE_NAME}. Technology meets conversation.`,
    SITE_URL,
  ].join("\n");
}

export function contactAcknowledgementHtml(purpose: string): string {
  const enquiry = describeEnquiry(purpose);
  // Absolute https URLs: an inbox has no origin to resolve a relative path on.
  const mark = `${SITE_URL}/email/axieonex-mark.png`;
  const particles = `${SITE_URL}/email/particle-x.png`;

  const shell = (inner: string) =>
    `<tr><td style="padding:0 40px;" class="ax-pad">${inner}</td></tr>`;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="dark" />
<meta name="supported-color-schemes" content="dark" />
<title>${contactAcknowledgementSubject()}</title>
<style type="text/css">
  body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
  table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;}
  img{-ms-interpolation-mode:bicubic;border:0;outline:none;text-decoration:none;display:block;}
  body{margin:0!important;padding:0!important;width:100%!important;background-color:${VOID}!important;}
  a{color:${CYAN};}
  @media only screen and (max-width:620px){
    .ax-pad{padding-left:24px!important;padding-right:24px!important;}
    .ax-display{font-size:40px!important;line-height:44px!important;letter-spacing:-1.4px!important;}
    .ax-closing{font-size:30px!important;line-height:34px!important;letter-spacing:-1px!important;}
    .ax-lead{font-size:17px!important;line-height:28px!important;}
    .ax-figure{font-size:34px!important;line-height:40px!important;white-space:nowrap!important;}
    .ax-stack{display:block!important;width:100%!important;}
    .ax-stack-gap{display:block!important;width:100%!important;height:14px!important;}
    .ax-space-lg{height:48px!important;}
    .ax-space-md{height:32px!important;}
    .ax-hide-sm{display:none!important;}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:${VOID};">
<div style="display:none;font-size:1px;color:${VOID};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">We&rsquo;ve received your ${enquiry} and will reply within one business day.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${VOID}" style="background-color:${VOID};">
<tr><td align="center" style="padding:0;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="ax-stack" style="width:600px;max-width:600px;background-color:${VOID};">

  <tr><td style="height:40px;line-height:40px;font-size:0;">&nbsp;</td></tr>

  <!-- HEADER -->
  ${shell(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="left" valign="middle" width="56" style="width:56px;"><img src="${mark}" width="44" height="44" alt="" style="display:block;width:44px;height:44px;border:0;" /></td>
      <td align="left" valign="middle" style="font-family:${FONT};font-size:19px;line-height:24px;font-weight:400;color:${WHITE};letter-spacing:1.6px;">${SITE_NAME}</td>
      <td align="right" valign="middle" class="ax-hide-sm" style="font-family:${FONT};font-size:11px;line-height:16px;font-weight:400;color:${ASH};letter-spacing:1.3px;text-transform:uppercase;">A conversation begins.</td>
    </tr>
  </table>`)}

  <tr><td style="height:56px;line-height:56px;font-size:0;" class="ax-space-lg">&nbsp;</td></tr>

  <!-- OPENING LABEL + HEADLINE -->
  ${shell(`<div style="font-family:${FONT};font-size:11px;line-height:16px;font-weight:400;color:${CYAN};letter-spacing:1.6px;text-transform:uppercase;">Your message is with us.</div>`)}
  <tr><td style="height:22px;line-height:22px;font-size:0;">&nbsp;</td></tr>
  ${shell(`<div class="ax-display" style="font-family:${FONT};font-size:54px;line-height:58px;font-weight:300;color:${WHITE};letter-spacing:-2px;">A small hello.<br /><span style="color:${IRIS};">A new possibility.</span></div>`)}

  <tr><td style="height:44px;line-height:44px;font-size:0;" class="ax-space-md">&nbsp;</td></tr>

  <!-- PARTICLE X -->
  <tr><td align="center" style="padding:0 20px;">
    <img src="${particles}" width="560" alt="" style="display:block;width:100%;max-width:560px;height:auto;border:0;" />
  </td></tr>

  <tr><td style="height:44px;line-height:44px;font-size:0;" class="ax-space-md">&nbsp;</td></tr>

  <!-- MESSAGE -->
  ${shell(`<div style="font-family:${FONT};font-size:24px;line-height:30px;font-weight:400;color:${WHITE};letter-spacing:-0.4px;">Thank you for reaching out.</div>`)}
  <tr><td style="height:18px;line-height:18px;font-size:0;">&nbsp;</td></tr>
  ${shell(`<div class="ax-lead" style="font-family:${FONT};font-size:18px;line-height:30px;font-weight:300;color:${MIST};">We&rsquo;ve received your ${enquiry}. We&rsquo;ll share your message with the right person on our team and get back to you within one business day.</div>`)}
  <tr><td style="height:20px;line-height:20px;font-size:0;">&nbsp;</td></tr>
  ${shell(`<div class="ax-lead" style="font-family:${FONT};font-size:18px;line-height:30px;font-weight:300;color:${MIST};">We look forward to learning more about what you have in mind.</div>`)}

  <tr><td style="height:48px;line-height:48px;font-size:0;" class="ax-space-md">&nbsp;</td></tr>

  <!-- RESPONSE TIME -->
  ${shell(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="left" valign="middle" width="320" class="ax-stack ax-figure" style="width:320px;font-family:${FONT};font-size:42px;line-height:48px;font-weight:300;color:${WHITE};letter-spacing:-1.5px;white-space:nowrap;">1 business day.</td>
      <td class="ax-stack-gap" style="font-size:0;line-height:0;width:24px;">&nbsp;</td>
      <td align="left" valign="middle" class="ax-stack" style="font-family:${FONT};font-size:15px;line-height:24px;font-weight:300;color:${ASH};">A reply from the right team.</td>
    </tr>
  </table>`)}

  <tr><td style="height:48px;line-height:48px;font-size:0;" class="ax-space-md">&nbsp;</td></tr>

  <!-- SIGN-OFF -->
  ${shell(`<div style="font-family:${FONT};font-size:17px;line-height:27px;font-weight:300;color:${WHITE};">Speak soon,<br />The ${SITE_NAME} team</div>`)}

  <tr><td style="height:40px;line-height:40px;font-size:0;" class="ax-space-md">&nbsp;</td></tr>

  <!-- CONTACT -->
  ${shell(`<div style="font-family:${FONT};font-size:15px;line-height:24px;font-weight:300;color:${ASH};">Have something to add?</div>
  <div style="font-family:${FONT};font-size:15px;line-height:24px;font-weight:400;"><a href="mailto:${CONTACT_EMAIL}" style="color:${CYAN};text-decoration:none;">${CONTACT_EMAIL}</a></div>`)}
  <tr><td style="height:18px;line-height:18px;font-size:0;">&nbsp;</td></tr>
  ${shell(`<div style="font-family:${FONT};font-size:12px;line-height:19px;font-weight:300;color:#6f6f6f;">This is an automated confirmation.<br />Replies to this email are not monitored.</div>`)}

  <tr><td style="height:72px;line-height:72px;font-size:0;" class="ax-space-lg">&nbsp;</td></tr>

  <!-- CLOSING BANNER -->
  ${shell(`<div style="font-family:${FONT};font-size:11px;line-height:16px;font-weight:400;color:${ASH};letter-spacing:1.6px;text-transform:uppercase;">AI-powered. Human-led.</div>`)}
  <tr><td style="height:20px;line-height:20px;font-size:0;">&nbsp;</td></tr>
  ${shell(`<div class="ax-closing" style="font-family:${FONT};font-size:40px;line-height:44px;font-weight:300;color:${WHITE};letter-spacing:-1.5px;">Better connections.<br /><span style="color:${IRIS};">New possibilities.</span></div>`)}

  <tr><td style="height:56px;line-height:56px;font-size:0;" class="ax-space-lg">&nbsp;</td></tr>

  <!-- FOOTER -->
  ${shell(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="left" valign="middle" style="font-family:${FONT};font-size:15px;line-height:22px;font-weight:400;color:${WHITE};letter-spacing:1.4px;"><a href="${SITE_URL}" style="color:${WHITE};text-decoration:none;">${SITE_NAME}</a></td>
      <td align="right" valign="middle" style="font-family:${FONT};font-size:12px;line-height:18px;font-weight:300;color:#6f6f6f;">Technology meets conversation.</td>
    </tr>
  </table>`)}

  <tr><td style="height:56px;line-height:56px;font-size:0;" class="ax-space-lg">&nbsp;</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
