import { NextRequest } from "next/server";

const MAX_OWNER_EMAIL_LENGTH = 254;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getOwnerName(request: NextRequest): string | null {
  const rawEmail = request.headers.get("x-archviz-user");
  if (!rawEmail) return null;

  const ownerEmail = rawEmail.trim().toLowerCase();
  if (!ownerEmail || ownerEmail.length > MAX_OWNER_EMAIL_LENGTH) return null;
  if (!EMAIL_PATTERN.test(ownerEmail)) return null;

  return ownerEmail;
}
