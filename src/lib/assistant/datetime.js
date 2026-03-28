const weekDays = {
  yakshanba: 0,
  dushanba: 1,
  seshanba: 2,
  chorshanba: 3,
  payshanba: 4,
  juma: 5,
  shanba: 6
};

const months = {
  yanvar: 0,
  fevral: 1,
  mart: 2,
  aprel: 3,
  may: 4,
  iyun: 5,
  iyul: 6,
  avgust: 7,
  sentyabr: 8,
  oktyabr: 9,
  noyabr: 10,
  dekabr: 11
};

const RELATIVE_DELAY_REGEX = /(\d{1,3})\s*(minut|daqiqa|daq|soat|kun)\s*(dan)?\s*(keyin|so'ng|song)/i;

export const extractDateTime = (text) => extractDateTimeDetails(text).datetime;

export const extractDateTimeDetails = (text) => {
  const now = new Date();
  const relativeDateTime = resolveRelativeDateTime(text, now);

  if (relativeDateTime) {
    return {
      datetime: relativeDateTime.toISOString(),
      timeFound: true,
      timeNeedsReview: false,
      usedDefaultTime: false
    };
  }

  const time = resolveTime(text);
  const date = resolveDate(text, now, time);
  const finalDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    time.hour,
    time.minute,
    0,
    0
  );

  return {
    datetime: finalDate.toISOString(),
    timeFound: time.found,
    timeNeedsReview: !time.found,
    usedDefaultTime: !time.found
  };
};

const resolveRelativeDateTime = (text, now) => {
  const match = text.match(RELATIVE_DELAY_REGEX);
  if (!match) {
    return null;
  }

  const amount = Number.parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  if (Number.isNaN(amount)) {
    return null;
  }

  const date = new Date(now);

  if (unit === "minut" || unit === "daqiqa" || unit === "daq") {
    date.setMinutes(date.getMinutes() + amount);
    return date;
  }

  if (unit === "soat") {
    date.setHours(date.getHours() + amount);
    return date;
  }

  if (unit === "kun") {
    date.setDate(date.getDate() + amount);
    return date;
  }

  return null;
};

const resolveDate = (text, now, time) => {
  const explicitDate = text.match(/(\d{1,2})\s*(yanvar|fevral|mart|aprel|may|iyun|iyul|avgust|sentyabr|oktyabr|noyabr|dekabr)/);
  if (explicitDate) {
    const day = Number.parseInt(explicitDate[1], 10);
    const month = months[explicitDate[2]];
    const candidate = new Date(now.getFullYear(), month, day, time.hour, time.minute, 0, 0);

    if (candidate < now) {
      candidate.setFullYear(candidate.getFullYear() + 1);
    }

    return candidate;
  }

  const offsetCandidate = resolveOffsetDate(text, now);
  const weekDayCandidate = resolveWeekDayDate(text, now);

  if (offsetCandidate && weekDayCandidate) {
    return weekDayCandidate > offsetCandidate ? weekDayCandidate : offsetCandidate;
  }

  return weekDayCandidate || offsetCandidate || new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const resolveOffsetDate = (text, now) => {
  if (/indin|indinga/.test(text)) {
    return buildDateFromOffset(now, 2);
  }
  if (/ertaga/.test(text)) {
    return buildDateFromOffset(now, 1);
  }
  if (/bugun/.test(text)) {
    return buildDateFromOffset(now, 0);
  }
  return null;
};

const resolveWeekDayDate = (text, now) => {
  const matchedWeekDay = Object.entries(weekDays).find(([name]) => text.includes(name));
  if (!matchedWeekDay) {
    return null;
  }

  const [, dayIndex] = matchedWeekDay;
  const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let difference = (dayIndex + 7 - now.getDay()) % 7;
  if (difference === 0) {
    difference = 7;
  }
  candidate.setDate(candidate.getDate() + difference);
  return candidate;
};

const resolveTime = (text) => {
  const patterns = [
    /soat\s*(\d{1,2})(?::|\.)(\d{2})/i,
    /\b(\d{1,2}):(\d{2})(?:\s*(?:da|ga))?\b/i,
    /\b(\d{1,2})\s+(\d{2})(?:\s*(?:da|ga))\b/i,
    /\b(\d{1,2})(\d{2})(?:\s*(?:da|ga))\b/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return safeTime(Number.parseInt(match[1], 10), Number.parseInt(match[2], 10), text, true);
    }
  }

  const hourWithLabel = text.match(/soat\s*(\d{1,2})\s*(?:da|ga)?\b/i);
  if (hourWithLabel) {
    return safeTime(Number.parseInt(hourWithLabel[1], 10), 0, text, true);
  }

  const shortHour = text.match(/(?<!:)\b(\d{1,2})\s*(da|ga)\b/i);
  if (shortHour && !RELATIVE_DELAY_REGEX.test(text)) {
    return safeTime(Number.parseInt(shortHour[1], 10), 0, text, true);
  }

  return { hour: 9, minute: 0, found: false };
};

const safeTime = (hour, minute, text, found) => {
  let resolvedHour = hour;
  const resolvedMinute = Number.isNaN(minute) ? 0 : minute;

  if (text.includes("kechqurun") || text.includes("kechasi") || text.includes("tushdan keyin")) {
    if (resolvedHour < 12) {
      resolvedHour += 12;
    }
  }

  if (Number.isNaN(resolvedHour) || resolvedHour < 0 || resolvedHour > 23) {
    return { hour: 9, minute: 0, found: false };
  }

  if (resolvedMinute < 0 || resolvedMinute > 59) {
    return { hour: resolvedHour, minute: 0, found: false };
  }

  return { hour: resolvedHour, minute: resolvedMinute, found };
};

const buildDateFromOffset = (now, offset) => {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
};
