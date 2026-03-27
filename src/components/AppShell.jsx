import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BottomDock from "./BottomDock";
import SettingsSheet from "./SettingsSheet";
import ReminderGuardian from "./ReminderGuardian";

const AppShell = ({ children }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const title = getPageTitle(location.pathname, t);

  return (
    <div className="min-h-screen bg-transparent transition-colors duration-300">
      <header className="sticky top-0 z-20 border-b border-ink-200/70 bg-white/80 backdrop-blur dark:border-ink-700/70 dark:bg-ink-900/80">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-ink-900 dark:bg-ink-100" />
            <span className="text-sm font-semibold text-ink-900 dark:text-ink-100">
              {title}
            </span>
          </div>
          <span className="text-[11px] uppercase tracking-[0.18em] text-ink-500 dark:text-ink-400">
            KOTIBA AI
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-32 pt-6 transition-opacity duration-500 sm:px-6 sm:pt-8">
        {children}
      </main>

      <ReminderGuardian />
      <BottomDock />
      <SettingsSheet />
    </div>
  );
};

const getPageTitle = (pathname, t) => {
  if (pathname === "/analytics") {
    return t("analytics");
  }

  return t("reminders");
};

export default AppShell;
