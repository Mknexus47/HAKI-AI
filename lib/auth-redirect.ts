// Sanitizes a post-login redirect target so it can only be a same-site path.
export function safeNextPath(raw: string | null | undefined): string {
  if (!raw) return "/";
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) {
    return "/";
  }
  return raw;
}

export function buildSignupHref(email: string, next: string): string {
  const params = new URLSearchParams();
  if (email) params.set("email", email);
  params.set("next", next || "/");
  const query = params.toString();
  return `/signup${query ? `?${query}` : ""}`;
}
