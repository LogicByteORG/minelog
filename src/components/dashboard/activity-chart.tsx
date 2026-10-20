import type { DayActivity } from "@/lib/dashboard";

function tipFor(day: DayActivity): string {
  if (day.total === 0) return `${day.day}: no logs`;
  const logs = `${day.total} ${day.total === 1 ? "log" : "logs"}`;
  return day.withErrors > 0 ? `${day.day}: ${logs}, ${day.withErrors} with errors` : `${day.day}: ${logs}`;
}

export function ActivityChart({ days }: { days: DayActivity[] }) {
  const peak = Math.max(1, ...days.map((day) => day.total));
  const total = days.reduce((sum, day) => sum + day.total, 0);

  return (
    <figure className="dash-activity">
      <div
        className="dash-activity__bars"
        role="img"
        aria-label={`Logs saved per day over the last ${days.length} days: ${total} in total.`}
      >
        {days.map((day) => (
          <div key={day.day} className="dash-activity__col" data-tip={tipFor(day)}>
            <span
              className="dash-activity__bar"
              style={{ height: `${(day.total / peak) * 100}%` }}
            >
              <span
                className="dash-activity__errors"
                style={{ height: `${day.total > 0 ? (day.withErrors / day.total) * 100 : 0}%` }}
              />
            </span>
          </div>
        ))}
      </div>
      <figcaption className="dash-activity__axis">
        <span>{days[0]?.day}</span>
        <span className="dash-activity__key">
          <span className="dash-activity__swatch" aria-hidden="true" />
          With errors
        </span>
        <span>{days[days.length - 1]?.day}</span>
      </figcaption>
    </figure>
  );
}
