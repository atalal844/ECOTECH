type InquiryLike = {
  referenceCode: string;
  inquiryType: string;
  customerName: string;
  companyName?: string | null;
  email: string;
  phone: string;
  country: string;
  productNameSnapshot?: string | null;
  quantity?: string | null;
  message: string;
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function summary(i: InquiryLike) {
  return [
    `Reference: ${i.referenceCode}`,
    `Type: ${i.inquiryType}`,
    `Name: ${i.customerName}`,
    i.companyName ? `Company: ${i.companyName}` : "",
    `Email: ${i.email}`,
    `Phone: ${i.phone}`,
    `Country: ${i.country}`,
    i.productNameSnapshot ? `Product: ${i.productNameSnapshot}` : "",
    i.quantity ? `Quantity: ${i.quantity}` : "",
    "",
    i.message,
  ]
    .filter((l, idx, arr) => l !== "" || arr[idx - 1] !== "")
    .join("\n");
}

async function sendEmail(i: InquiryLike) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const to = (process.env.INQUIRY_NOTIFY_EMAIL || "h.awad@ecotelholding.com")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const from = process.env.INQUIRY_FROM_EMAIL || "ECOTECH <onboarding@resend.dev>";
  const digits = i.phone.replace(/[^\d]/g, "");
  const wa = digits ? `https://wa.me/${digits}` : "";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to,
      reply_to: i.email,
      subject: `New ECOTECH inquiry ${i.referenceCode} - ${i.customerName}`,
      text: summary(i) + (wa ? `\n\nWhatsApp the customer: ${wa}` : ""),
      html: `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6"><h3>New inquiry ${esc(i.referenceCode)}</h3><pre style="font-family:inherit;white-space:pre-wrap">${esc(summary(i))}</pre>${wa ? `<p><a href="${wa}">WhatsApp the customer</a></p>` : ""}</div>`,
    }),
  });
  if (!res.ok) console.error("Inquiry email failed:", res.status, await res.text().catch(() => ""));
}

async function sendWhatsApp(i: InquiryLike) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const to = (process.env.INQUIRY_NOTIFY_WHATSAPP || "").replace(/[^\d]/g, "");
  if (!token || !phoneId || !to) return;
  const template = process.env.WHATSAPP_TEMPLATE_NAME;
  const body = template
    ? {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: template,
          language: { code: process.env.WHATSAPP_TEMPLATE_LANG || "en" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: i.referenceCode },
                { type: "text", text: `${i.customerName} (${i.phone})` },
                { type: "text", text: (i.productNameSnapshot || i.inquiryType).slice(0, 120) },
              ],
            },
          ],
        },
      }
    : {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: summary(i).slice(0, 1500) },
      };
  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) console.error("Inquiry WhatsApp failed:", res.status, await res.text().catch(() => ""));
}

/** Never throws: a notification failure must not lose or fail the inquiry. */
export async function notifyNewInquiry(i: InquiryLike) {
  await Promise.allSettled([
    sendEmail(i).catch((e) => console.error("Inquiry email error:", e)),
    sendWhatsApp(i).catch((e) => console.error("Inquiry WhatsApp error:", e)),
  ]);
}
