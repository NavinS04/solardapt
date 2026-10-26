// The one place to change contact and booking details for the whole site.
// BOOKING_URL: paste your Cal.com event link (e.g. https://cal.com/<username>/planning-call).
// Until it's set, every "Book a call" button opens an email instead, so nothing is broken.
window.SOLARDAPT = {
  BOOKING_URL: "",
  EMAIL: "navinsonsana@solardapt.com",
  PHONE_DISPLAY: "07427 845540",
  PHONE_TEL: "+447427845540",
};

document.addEventListener("DOMContentLoaded", () => {
  const c = window.SOLARDAPT;
  const fallback = `mailto:${c.EMAIL}?subject=${encodeURIComponent("Planning call - Solardapt")}`;
  document.querySelectorAll("[data-book]").forEach(a => {
    a.href = c.BOOKING_URL || fallback;
    if (c.BOOKING_URL) { a.target = "_blank"; a.rel = "noopener"; }
  });
  document.querySelectorAll("[data-email]").forEach(a => { a.href = `mailto:${c.EMAIL}`; a.textContent = c.EMAIL; });
  document.querySelectorAll("[data-phone]").forEach(a => { a.href = `tel:${c.PHONE_TEL}`; a.textContent = c.PHONE_DISPLAY; });
  document.querySelectorAll("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });
});
