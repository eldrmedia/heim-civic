import "server-only";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getSecurityContactEmail() {
  const configured = process.env.SECURITY_CONTACT_EMAIL?.trim().toLowerCase();

  return configured && emailPattern.test(configured) ? configured : null;
}
