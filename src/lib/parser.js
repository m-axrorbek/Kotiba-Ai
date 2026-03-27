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
      message: item.message
    }));
};

