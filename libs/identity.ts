import { NextRequest } from "next/server";

const MAX_OWNER_NAME_LENGTH = 80;

export function getOwnerName(request: NextRequest): string | null {
  const rawName = request.headers.get("x-archviz-user");
  if (!rawName) return null;

  const ownerName = rawName.trim().replace(/\s+/g, " ").toLowerCase();
  if (!ownerName || ownerName.length > MAX_OWNER_NAME_LENGTH) return null;

  return ownerName;
}
