import { cleanAssistantInput } from "./clean.js";
import { extractDateTimeDetails } from "./datetime.js";

const DEFAULT_NOTIFY_BEFORE = 0;
const RELATIVE_DELAY_REGEX = /(\d{1,3})\s*(minut|daqiqa|daq|soat|kun)\s*(dan)?\s*(keyin|so'ng|song)/i;

const reminderSignals = [
  "eslat",
  "eslatma",
  "uchrashuv",
  "qo'ng'iroq",
  "qong'iroq",
  "dori",
  "topshiriq",
  "vazifa",
  "imtihon",
  "to'y",
  "ko'rish",
  "bor"
];

const expenseSignals = ["xarajat", "harajat", "ishlatdim", "sarfladim", "to'ladim", "toladim", "oldim"];
const noteSignals = ["qayd", "note", "yozib qo'y", "yozib qoy"];

export const analyzeAssistantInput = (rawText) => {
  const cleaned = cleanAssistantInput(rawText);
  if (!cleaned) {
    return null;
  }

  const intent = detectIntent(cleaned);
  if (intent !== "reminder") {
    return {
      intent,
      cleaned_text: cleaned
    };
  }

  return buildReminderPayload(cleaned);
};

export const splitAssistantSegments = (text) => {
  return cleanAssistantInput(text)
    .split(/,|\bva\b|\bham\b/)
    .map((segment) => segment.trim())
    .filter(Boolean);
};

const detectIntent = (text) => {
  const hasReminder = reminderSignals.some((signal) => text.includes(signal));
  const hasExpense = expenseSignals.some((signal) => text.includes(signal));
  const hasNote = noteSignals.some((signal) => text.includes(signal));

  const matches = [hasReminder, hasExpense, hasNote].filter(Boolean).length;
  if (matches > 1) {
    return "mixed";
  }
  if (hasExpense) {
    return "expense";
  }
  if (hasNote) {
    return "note";
  }
  return "reminder";
};

const buildReminderPayload = (cleaned) => {
  const isRelative = RELATIVE_DELAY_REGEX.test(cleaned);
  const notifyBefore = isRelative ? 0 : extractNotifyBefore(cleaned);
  const title = extractReminderTitle(cleaned);
  const dateTimeDetails = extractDateTimeDetails(cleaned);

  return {
    intent: "reminder",
    title,
    datetime: dateTimeDetails.datetime,
    notify_before: notifyBefore,
    message: buildReminderMessage({ title, notifyBefore, datetime: dateTimeDetails.datetime, isRelative }),
    time_found: dateTimeDetails.timeFound,
    time_needs_review: dateTimeDetails.timeNeedsReview,
    used_default_time: dateTimeDetails.usedDefaultTime
  };
};

const extractNotifyBefore = (text) => {
  const match = text.match(/(\d{1,3})\s*(minut|daq|daqiqa)\s*(oldin|avval)\s*eslat/);
  if (!match) {
    return DEFAULT_NOTIFY_BEFORE;
  }
  return Number.parseInt(match[1], 10) || DEFAULT_NOTIFY_BEFORE;
};

const extractReminderTitle = (text) => {
  let cleaned = text
    .replace(RELATIVE_DELAY_REGEX, " ")
    .replace(/(\d{1,3})\s*(minut|daq|daqiqa)\s*(oldin|avval)\s*eslat/g, " ")
    .replace(/(bugun|ertaga|indin|indinga)/g, " ")
    .replace(/(dushanba|seshanba|chorshanba|payshanba|juma|shanba|yakshanba)/g, " ")
    .replace(/soat\s*\d{1,2}(?::|\.)?\d{0,2}/g, " ")
    .replace(/\b\d{1,2}:\d{2}(?:\s*(?:da|ga))?\b/g, " ")
    .replace(/\b\d{1,2}\s*(da|ga)\b/g, " ")
    .replace(/(eslat|eslatma|boraman|ketaman|qilaman|bo'ladi|boladi|uchrashuvim|uchrashuvga|uchrashuvimga|bor|vaqti|keldi)/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (/uchrashuv/.test(text)) return "uchrashuv";
  if (/imtihon/.test(text)) return "imtihon";
  if (/dori/.test(text)) return "dori";
  if (/to'y|toy/.test(text)) return "to'y";
  if (/qo'ng'iroq|qong'iroq/.test(text)) return "qo'ng'iroq";
  if (/kino\s+ko'r/.test(text)) return "kino ko'rish";

  return extractShortTitle(cleaned || text);
};

const extractShortTitle = (text) => {
  const meaningful = text
    .replace(/[^\p{L}\p{N}\s']/gu, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean)
    .map(normalizeWord)
    .filter((word) => word.length > 1)
    .slice(0, 2);

  if (!meaningful.length) {
    return "eslatma";
  }

  return meaningful.join(" ");
};

const normalizeWord = (word) => {
  return word
    .replace(/ishni$/u, "ish")
    .replace(/(im|ing|imiz|ingiz|ga|ni|da|dan|lar|lari)$/u, "")
    .trim();
};

const buildReminderMessage = ({ title, notifyBefore, datetime, isRelative }) => {
  if (isRelative) {
    return `${title} vaqti keldi`;
  }

  if (notifyBefore > 0) {
    return `${notifyBefore} minutdan keyin ${title} bor`;
  }

  const date = new Date(datetime);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes} da ${title} bor`;
};
