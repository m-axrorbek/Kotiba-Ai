export const KOTIBA_REMINDER_SYSTEM_PROMPT = `You are a senior full-stack engineer.

Build a voice-based reminder system for an Uzbek AI assistant called KOTIBA AI.

CORE GOAL
User speaks in Uzbek -> system understands -> creates reminder -> at correct time -> speaks reminder using TTS voice (Lola voice style).

RULES
- Return ONLY valid JSON.
- No markdown.
- No explanation.
- Never hallucinate.
- intent must be "reminder" for reminder requests.
- title must be 1-2 short Uzbek words.
- Clean spelling mistakes.
- Normalize numbers.
- If user says a relative delay like "2 minutdan keyin" or "1 soatdan keyin", set datetime to the exact future time from Current time and set notify_before to 0.
- If user says "10 minut oldin eslat", that means notify_before is 10.
- If user gives only an absolute date/time and does not say "oldin eslat", default notify_before must be 0.
- If time is missing and there is no relative delay, default time is 09:00.
- message must be short, natural, and TTS-friendly.

GOOD EXAMPLES
Input: ertaga soat 5 da uchrashuv bor 10 minut oldin eslat
Output: {"intent":"reminder","title":"uchrashuv","datetime":"ISO","notify_before":10,"message":"10 minutdan keyin uchrashuv bor"}

Input: 2 minutdan keyin kino ko'rishni eslat
Output: {"intent":"reminder","title":"kino ko'rish","datetime":"Current time + 2 minutes as ISO","notify_before":0,"message":"kino ko'rish vaqti keldi"}

Input: 27 mart kuni 22:15 da kino ko'rish
Output: {"intent":"reminder","title":"kino ko'rish","datetime":"ISO","notify_before":0,"message":"22:15 da kino ko'rish bor"}`;

export const buildKotibaReminderMessages = (text, nowIso = new Date().toISOString()) => [
  {
    role: "system",
    content: KOTIBA_REMINDER_SYSTEM_PROMPT
  },
  {
    role: "user",
    content: `Current time: ${nowIso}\nUser input: ${text}`
  }
];

export const sanitizeJsonText = (value) => {
  const text = String(value || "").trim();
  if (!text) {
    return "";
  }

  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
};

export const normalizeReminderPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if (payload.intent !== "reminder") {
    return null;
  }

  if (!payload.title || !payload.datetime) {
    return null;
  }

  const notifyBefore = Number(payload.notify_before ?? 0);

  return {
    intent: "reminder",
    title: String(payload.title).trim().split(/\s+/).slice(0, 2).join(" ") || "eslatma",
    datetime: String(payload.datetime),
    notify_before: Number.isNaN(notifyBefore) ? 0 : notifyBefore,
    message: String(payload.message || "").trim() || `${String(payload.title).trim()} vaqti keldi`
  };
};
