import { useMemo } from "react";
import { addDays, format, isSameDay, parseISO, startOfWeek } from "date-fns";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { BarChart3, CalendarDays } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useReminderStore } from "../store/useReminderStore";
import { isToday } from "../lib/time";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

const tooltipProps = {
  contentStyle: {
    background: "var(--tooltip-bg)",
    border: "1px solid var(--tooltip-border)",
    borderRadius: "12px",
    color: "var(--tooltip-text)"
  },
  itemStyle: {
    color: "var(--tooltip-text)"
  },
  labelStyle: {
    color: "var(--tooltip-text)"
  }
};

const Analytics = () => {
  const { t } = useTranslation();
  const reminders = useReminderStore((state) => state.reminders);

  const stats = useMemo(() => {
    const total = reminders.length;
    const completed = reminders.filter((reminder) => reminder.completed).length;
    const pending = total - completed;
    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

    const todayReminders = reminders
      .filter((reminder) => isToday(reminder.datetime))
      .sort((a, b) => parseISO(a.datetime).getTime() - parseISO(b.datetime).getTime());

    return {
      total,
      completed,
      pending,
      completionRate,
      todayReminders,
      summary: buildSummary(todayReminders, t),
      weekData: buildWeekData(reminders, t),
      pieData: [
        { name: t("completed"), value: completed, color: "var(--pie-completed)" },
        { name: t("pending"), value: pending, color: "var(--pie-pending)" }
      ]
    };
  }, [reminders, t]);

  if (stats.total === 0) {
    return (
      <Card className="border-dashed bg-transparent dark:border-ink-700">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-ink-100 p-4 dark:bg-ink-800">
            <CalendarDays className="h-7 w-7 text-ink-500 dark:text-ink-300" />
          </div>
          <p className="mt-5 text-xl font-semibold text-ink-950 dark:text-ink-50">
            {t("analyticsEmptyTitle")}
          </p>
          <p className="mt-2 max-w-sm text-sm text-ink-500 dark:text-ink-300">
            {t("analyticsEmptyHint")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pb-36">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title={t("totalReminders")} value={stats.total} />
        <StatCard title={t("completed")} value={stats.completed} />
        <StatCard title={t("completionRate")} value={`${stats.completionRate}%`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr,0.7fr]">
        <Card className="dark:bg-ink-900/95">
          <CardHeader>
            <CardTitle className="section-title">{t("weeklyChart")}</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weekData} margin={{ left: -10, right: 10, top: 10 }}>
                <XAxis
                  dataKey="name"
                  stroke="var(--chart-axis)"
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-18}
                  textAnchor="end"
                  height={52}
                  tick={{ fontSize: 14, fontWeight: 600, fill: "var(--chart-axis)" }}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="var(--chart-axis)"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--chart-axis)" }}
                />
                <Tooltip cursor={{ fill: "rgba(127, 127, 127, 0.12)" }} {...tooltipProps} />
                <Bar dataKey="tasks" fill="var(--chart-bar)" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="dark:bg-ink-900/95">
          <CardHeader>
            <CardTitle className="section-title">{t("pieChart")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip {...tooltipProps} />
                  <Pie
                    data={stats.pieData}
                    dataKey="value"
                    innerRadius={52}
                    outerRadius={84}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {stats.pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid gap-2 text-sm text-ink-700 dark:text-ink-100">
              {stats.pieData.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between rounded-2xl bg-ink-50 px-3 py-2 dark:bg-ink-800/90">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span>{entry.name}</span>
                  </div>
                  <span>
                    {entry.value} {stats.total === 0 ? "(0%)" : `(${Math.round((entry.value / stats.total) * 100)}%)`}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="dark:bg-ink-900/95">
          <CardHeader>
            <CardTitle className="section-title">{t("dailyTimeline")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.todayReminders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-ink-200 px-4 py-8 text-center dark:border-ink-700">
                <p className="text-base font-medium text-ink-900 dark:text-ink-100">{t("analyticsEmptyTitle")}</p>
                <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">{t("analyticsEmptyHint")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.todayReminders.map((reminder) => (
                  <div key={reminder.id} className="flex items-center gap-4 rounded-2xl bg-ink-50 px-3 py-3 dark:bg-ink-800/80">
                    <div className="flex h-10 w-20 items-center justify-center rounded-full bg-white text-sm font-semibold text-ink-700 dark:bg-ink-950 dark:text-ink-50">
                      {format(parseISO(reminder.datetime), "HH:mm")}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          reminder.completed
                            ? "text-ink-500 line-through dark:text-ink-400"
                            : "text-ink-900 dark:text-ink-100"
                        }`}
                      >
                        {reminder.title}
                      </p>
                      <p className="text-xs text-ink-500 dark:text-ink-300">
                        {reminder.completed ? t("completed") : t("pending")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="dark:bg-ink-900/95">
          <CardHeader>
            <CardTitle className="section-title">{t("aiSummary")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-3xl bg-ink-50 p-5 dark:bg-ink-800/90">
              <div className="mb-3 flex items-center gap-2 text-ink-900 dark:text-ink-100">
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm font-semibold">{t("analyticsOverview")}</span>
              </div>
              <p className="text-base text-ink-700 dark:text-ink-100">{stats.summary}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <Card className="dark:bg-ink-900/95">
    <CardContent className="space-y-2 px-5 py-5">
      <p className="text-sm text-ink-500 dark:text-ink-300">{title}</p>
      <p className="section-title text-3xl font-semibold text-ink-950 dark:text-ink-50">{value}</p>
    </CardContent>
  </Card>
);

const buildWeekData = (reminders, t) => {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const labels = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index);
    const count = reminders.filter((reminder) => isSameDay(parseISO(reminder.datetime), date)).length;

    return {
      name: t(labels[index]),
      tasks: count
    };
  });
};

const buildSummary = (todayReminders, t) => {
  if (!todayReminders.length) {
    return t("analyticsEmptyTitle");
  }

  const completed = todayReminders.filter((reminder) => reminder.completed).length;
  const period = getMostActivePeriod(todayReminders, t);

  return t("summaryTemplate", {
    count: completed,
    period
  });
};

const getMostActivePeriod = (reminders, t) => {
  const buckets = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0
  };

  reminders.forEach((reminder) => {
    const hour = parseISO(reminder.datetime).getHours();
    if (hour >= 5 && hour < 12) {
      buckets.morning += 1;
    } else if (hour >= 12 && hour < 17) {
      buckets.afternoon += 1;
    } else if (hour >= 17 && hour < 22) {
      buckets.evening += 1;
    } else {
      buckets.night += 1;
    }
  });

  const [period] = Object.entries(buckets).sort((a, b) => b[1] - a[1])[0];

  if (period === "morning") return t("periodMorning");
  if (period === "afternoon") return t("periodAfternoon");
  if (period === "evening") return t("periodEvening");
  return t("periodNight");
};

export default Analytics;
