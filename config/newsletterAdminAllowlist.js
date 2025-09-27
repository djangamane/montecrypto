export const NEWSLETTER_ADMIN_EMAILS = [
  'jason@abitofadvicellc.com',
  'janga.bussaja@gmail.com',
];

export function isNewsletterAdmin(email) {
  if (!email) return false;
  return NEWSLETTER_ADMIN_EMAILS.includes(email.toLowerCase());
}
