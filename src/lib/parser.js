import { analyzeAssistantInput, splitAssistantSegments } from "./assistant/parse.js";

export const parseUzbekText = (text) => {
  const segments = splitAssistantSegments(text);

  return segments
    .map((segment) => analyzeAssistantInput(segment))
    .filter((item) => item?.intent === "reminder")
    .map((item) => ({
      type: "reminder",
      title: item.title,
      datetime: item.datetime,
      notify_before: item.notify_before,
      recurrence: "none",
      message: item.message,
      time_found: item.time_found,
      time_needs_review: item.time_needs_review,
      used_default_time: item.used_default_time
    }));
};

