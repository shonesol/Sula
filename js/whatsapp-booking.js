// Booking form → WhatsApp +256702094292
const WHATSAPP_NUMBER = "256702094292";

document.getElementById("booking-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const name = (fd.get("name") || "").trim();
  const email = (fd.get("email") || "").trim();
  const phone = (fd.get("phone") || "").trim();
  const safari = (fd.get("safari") || "").trim();
  const dates = (fd.get("dates") || "").trim();
  const guests = (fd.get("guests") || "").trim();
  const message = (fd.get("message") || "").trim();

  const text = [
    "*Chichi Safaris – Booking Enquiry*",
    "",
    `*Name:* ${name}`,
    `*Email:* ${email}`,
    `*Phone:* ${phone}`,
    `*Safari / Package:* ${safari}`,
    `*Preferred Dates:* ${dates}`,
    `*Guests:* ${guests}`,
    message ? `*Message:* ${message}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
});
