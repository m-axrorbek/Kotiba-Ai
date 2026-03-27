import { useState } from "react";
import { useTranslation } from "react-i18next";
import { v4 as uuid } from "uuid";
import { BellRing, Sparkles } from "lucide-react";
import VoiceInput from "../components/VoiceInput";
import ReminderList from "../components/ReminderList";
import { Card, CardContent } from "../components/ui/card";
import { useReminderStore } from "../store/useReminderStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { cleanUzbekInput } from "../lib/cleaner";
import { parseUzbekText } from "../lib/parser";
import { announceCreatedReminders } from "../lib/reminderSpeech";
import { useNotifications } from "../hooks/useNotifications";
import { assistantApi } from "../lib/api";

const Home = () => {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState(null);
  const addReminders = useReminderStore((state) => state.addReminders);
  const voiceEnabled = useSettingsStore((state) => state.voiceEnabled);
  const { permission, requestPermission } = useNotifications();

  const handleVoiceSend = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    setIsParsing(true);
    setError(null);

    try {
      const cleaned = cleanUzbekInput(trimmed);
      const parsedReminders = await resolveReminderDrafts(cleaned);

      if (!parsedReminders.length) {
        setError("PARSE_FAILED");
        return;
      }

      const reminders = parsedReminders.map((draft) => mapDraftToReminder(draft));
      addReminders(reminders);
      setInput("");

      if (permission === "default") {
        void requestPermission();
      }

      await announceCreatedReminders({
        reminders,
        voiceEnabled,
        language: "uz",
        t
      });
    } catch (parseError) {
      console.error(parseError);
      setError("PARSE_FAILED");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="grid gap-6 pb-36">
      <Card className="overflow-hidden border-0 bg-gradient-to-b from-ink-50 to-white shadow-soft dark:from-ink-900 dark:to-ink-950">
        <CardContent className="space-y-6 px-5 py-6 sm:px-7">
          <div className="space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-500 dark:text-ink-400">
              {t("voiceAssistant")}
            </p>
            <h1 className="section-title text-2xl font-semibold text-ink-950 dark:text-ink-50">
              {t("voiceHeroTitle")}
            </h1>
            <p className="mx-auto max-w-md text-sm text-ink-600 dark:text-ink-300">
              {t("voiceHeroHint")}
            </p>
          </div>

          <div className="rounded-[2rem] border border-ink-200 bg-white px-5 py-6 shadow-soft dark:border-ink-700 dark:bg-ink-900">
            <VoiceInput value={input} onChange={setInput} onSendText={handleVoiceSend} variant="dock" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-ink-200 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-900">
              <div className="flex items-center gap-2 text-ink-900 dark:text-ink-100">
                <Sparkles className="h-4 w-4" />
                <p className="text-sm font-semibold">{t("voiceTipTitle")}</p>
              </div>
              <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">{t("voiceTipBody")}</p>
            </div>
            <div className="rounded-2xl border border-ink-200 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-900">
              <div className="flex items-center gap-2 text-ink-900 dark:text-ink-100">
                <BellRing className="h-4 w-4" />
                <p className="text-sm font-semibold">{t("lolaTipTitle")}</p>
              </div>
              <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">{t("lolaTipBody")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-ink-700 dark:text-ink-300">{t("parseFailed")}</p> : null}
      {isParsing ? <p className="text-xs text-ink-500 dark:text-ink-400">{t("parseWithAI")}...</p> : null}

      <ReminderList />
    </div>
  );
};

const resolveReminderDrafts = async (text) => {
  try {
    const analyzed = await assistantApi.analyze(text);
    if (analyzed?.intent === "reminder") {
      return [analyzed];
    }
  } catch (_error) {
    // Local parser is the stable fallback.
  }

  return parseUzbekText(text);
};

const mapDraftToReminder = (draft) => ({
  id: uuid(),
  type: "reminder",
  title: draft.title,
  datetime: toIsoString(draft.datetime),
  notifyBefore: draft.notify_before ?? draft.notifyBefore ?? 0,
  recurrence: draft.recurrence ?? "none",
  message: draft.message,
  createdAt: new Date().toISOString(),
  notified: false,
  completed: false
});

const toIsoString = (value) => {
  if (!value) {
    return new Date().toISOString();
  }
  if (value.includes("Z") || value.includes("+")) {
    return new Date(value).toISOString();
  }

  const [datePart, timePart] = value.split("T");
  if (!datePart || !timePart) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
  }

  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);
  const local = new Date(year, (month ?? 1) - 1, day ?? 1, hours ?? 0, minutes ?? 0, 0);
  return local.toISOString();
};

export default Home;
