import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

const ReminderForm = ({ onSubmit }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [datetime, setDatetime] = useState("");
  const [notifyBefore, setNotifyBefore] = useState(10);
  const [recurrence, setRecurrence] = useState("none");

  const handleSubmit = () => {
    if (!title || !datetime) {
      return;
    }
    onSubmit({ title, datetime, notifyBefore, recurrence });
    setTitle("");
    setDatetime("");
    setNotifyBefore(10);
    setRecurrence("none");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="section-title">{t("addReminder")}</CardTitle>
        <CardDescription>{t("dateTime")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-ink-600">{t("title")}</label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-ink-600">{t("dateTime")}</label>
            <Input
              type="datetime-local"
              value={datetime}
              onChange={(event) => setDatetime(event.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-ink-600">{t("notifyBefore")}</label>
            <Input
              type="number"
              min={1}
              value={notifyBefore}
              onChange={(event) => setNotifyBefore(Number(event.target.value))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-ink-600">{t("recurrence")}</label>
            <select
              className="h-10 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-900"
              value={recurrence}
              onChange={(event) => setRecurrence(event.target.value)}
            >
              <option value="none">{t("recurrenceNone")}</option>
              <option value="daily">{t("recurrenceDaily")}</option>
              <option value="weekly">{t("recurrenceWeekly")}</option>
            </select>
          </div>
        </div>
        <Button onClick={handleSubmit}>{t("addReminder")}</Button>
      </CardContent>
    </Card>
  );
};

export default ReminderForm;
