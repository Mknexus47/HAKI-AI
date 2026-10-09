import { createClient } from "@/lib/supabase-client";

// Pre-defined blocked terms — intentionally conservative and transparent.
const BLOCKED_KEYWORDS = [
  "murder",
  "bribe",
  "bribery",
  "kill",
  "bomb",
  "poison",
  "smuggle",
  "human trafficking",
  "run from the police",
  "hide stolen",
];

const MAX_REQUESTS_PER_MINUTE = 5;
const FLAGS_BEFORE_TEMP_BAN = 3;

export type ModerationAction = "allow" | "flag" | "ban";

export interface ModerationResult {
  action: ModerationAction;
  reason?: string;
}

function getRecentTimestamps(): number[] {
  try {
    const raw = window.sessionStorage.getItem("haki-req-times");
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

function pushRecentTimestamp(): void {
  try {
    const now = Date.now();
    const recent = getRecentTimestamps().filter(
      (time) => now - time < 60_000
    );
    recent.push(now);
    window.sessionStorage.setItem("haki-req-times", JSON.stringify(recent));
  } catch {
    // ignore storage failures
  }
}

function getLocalFlagCount(): number {
  try {
    return Number(window.localStorage.getItem("haki-flags") || "0");
  } catch {
    return 0;
  }
}

function setLocalFlagCount(count: number): void {
  try {
    window.localStorage.setItem("haki-flags", String(count));
  } catch {
    // ignore
  }
}

export function isTemporarilyBanned(): boolean {
  return getLocalFlagCount() >= FLAGS_BEFORE_TEMP_BAN;
}

async function recordFlag(reason: string, snippet: string): Promise<void> {
  const next = getLocalFlagCount() + 1;
  setLocalFlagCount(next);
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("flagged_sessions").insert({
      user_id: user?.id ?? null,
      reason,
      snippet: snippet.slice(0, 80),
      flag_count: next,
      status: "pending",
    });
  } catch {
    // Flagging must not block the safety notice itself.
  }
}

/**
 * Checks a chat question against the moderation rules.
 * Returns "allow", "flag" (user is notified for safety review) or "ban".
 */
export async function moderateQuestion(
  question: string
): Promise<ModerationResult> {
  if (isTemporarilyBanned()) {
    return { action: "ban" };
  }

  pushRecentTimestamp();

  // Word-boundary matching so innocent words never trip the filter
  // (e.g. "kill" inside "skill", "bomb" inside "bombard").
  const keyword = BLOCKED_KEYWORDS.find((word) =>
    new RegExp(`\\b${word}\\b`, "i").test(question)
  );

  if (keyword) {
    await recordFlag(`blocked keyword: ${keyword}`, question);
    return { action: "flag", reason: `blocked keyword: ${keyword}` };
  }

  const recent = getRecentTimestamps().filter(
    (time) => Date.now() - time < 60_000
  );
  if (recent.length > MAX_REQUESTS_PER_MINUTE) {
    await recordFlag("rapid-fire requests", question);
    return { action: "flag", reason: "rapid-fire requests" };
  }

  return { action: "allow" };
}
