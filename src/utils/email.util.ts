export function isValidEmail(email: string): boolean {
  return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
}

export function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (name.length < 3) return email;
  return name.slice(0, 2) + '***@' + domain;
}
export function extractEmailDomain(email: string): string {
  const atIndex = email.indexOf('@');
  if (atIndex === -1) return '';
  return email.slice(atIndex + 1);
}
export function isValidEmailDomain(
  email: string,
  validDomains: string[],
): boolean {
  const domain = extractEmailDomain(email);
  return validDomains.includes(domain);
}
