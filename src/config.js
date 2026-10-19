// Email order requests via EmailJS (free tier: 200 emails a month).
// Leave these blank and the site falls back to WhatsApp / SMS only.
// Setup steps are in docs/email-orders.md.
export const EMAILJS = {
  publicKey: "",
  serviceId: "",
  // Sent to the nursery with the full order.
  ownerTemplateId: "",
  // Sent to the customer as their confirmation (only when they give an email).
  customerTemplateId: "",
};

export const emailOrdersEnabled = () => Boolean(EMAILJS.publicKey && EMAILJS.serviceId && EMAILJS.ownerTemplateId);
