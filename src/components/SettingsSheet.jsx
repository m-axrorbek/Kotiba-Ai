import { Bell, Volume2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import ThemeToggle from "./ThemeToggle";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Switch } from "./ui/switch";
import { useNotifications } from "../hooks/useNotifications";
import { hasUzbekVoiceKey, hasUzbekVoiceTtsKey } from "../lib/uzbekVoice";
import { useSettingsStore } from "../store/useSettingsStore";

const SettingsSheet = () => {
  const { t } = useTranslation();
  const settingsOpen = useSettingsStore((state) => state.settingsOpen);
  const closeSettings = useSettingsStore((state) => state.closeSettings);
  const voiceEnabled = useSettingsStore((state) => state.voiceEnabled);
  const setVoiceEnabled = useSettingsStore((state) => state.setVoiceEnabled);
  const { permission, requestPermission } = useNotifications();

  if (!settingsOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/20 px-4 pb-28 pt-10">
      <button type="button" className="absolute inset-0 cursor-default" onClick={closeSettings} aria-label={t("close")} />
      <div className="relative w-full max-w-md">
        <Card>
          <CardHeader className="flex items-center justify-between gap-3">
            <CardTitle className="section-title">{t("settings")}</CardTitle>
            <button
              type="button"
              onClick={closeSettings}
              className="rounded-full p-2 text-ink-500 transition-colors hover:text-ink-900 dark:text-ink-300 dark:hover:text-white"
              aria-label={t("close")}
            >
              <X className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">{t("enableNotifications")}</p>
                <p className="text-xs text-ink-500 dark:text-ink-400">
                  {permission === "granted" ? t("permissionGranted") : t("permissionDenied")}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => void requestPermission()}>
                <Bell className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">{t("voiceAlerts")}</p>
                <p className="text-xs text-ink-500 dark:text-ink-400">
                  {hasUzbekVoiceTtsKey() ? t("lolaReady") : t("ttsMissing")}
                </p>
              </div>
              <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">UzbekVoice STT</p>
                <p className="text-xs text-ink-500 dark:text-ink-400">
                  {hasUzbekVoiceKey() ? t("aiReady") : t("sttMissing")}
                </p>
              </div>
              <Volume2 className="h-5 w-5 text-ink-400 dark:text-ink-500" />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">{t("appearance")}</p>
                <p className="text-xs text-ink-500 dark:text-ink-400">{t("appearanceHint")}</p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsSheet;
