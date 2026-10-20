import Link from "next/link";
import { Trash } from "@phosphor-icons/react/dist/ssr";
import type { OwnedLog } from "@/lib/dashboard";
import { formatDate, formatUtc } from "@/lib/time";

function Count({ value, tone }: { value: number; tone: "error" | "warn" }) {
  if (value === 0) return <span className="dash-table__zero">0</span>;
  return (
    <span className={`dash-table__count dash-table__count--${tone}`}>
      {value.toLocaleString("en")}
    </span>
  );
}

export function LogTable({
  logs,
  onDelete,
}: {
  logs: OwnedLog[];
  onDelete?: (log: OwnedLog) => void;
}) {
  return (
    <div className="dash-table__wrap">
      <table className="dash-table">
        <thead>
          <tr>
            <th scope="col">Log</th>
            <th scope="col">Type</th>
            <th scope="col" className="dash-table__num">
              Lines
            </th>
            <th scope="col" className="dash-table__num">
              Errors
            </th>
            <th scope="col" className="dash-table__num">
              Warnings
            </th>
            <th scope="col">Saved</th>
            <th scope="col">Expires</th>
            {onDelete && (
              <th scope="col" className="dash-table__end">
                <span className="show-for-sr">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>
                <Link
                  href={log.isPrivate ? `/p/${log.id}` : `/${log.id}`}
                  className="dash-table__id"
                >
                  {log.id}
                </Link>
                {log.isPrivate && <span className="dash-tag">Private</span>}
              </td>
              <td>{log.typeLabel}</td>
              <td className="dash-table__num">{log.lineCount.toLocaleString("en")}</td>
              <td className="dash-table__num">
                <Count value={log.errorCount} tone="error" />
              </td>
              <td className="dash-table__num">
                <Count value={log.warnCount} tone="warn" />
              </td>
              <td>{formatUtc(log.createdAt)}</td>
              <td>{formatDate(log.expiresAt)}</td>
              {onDelete && (
                <td className="dash-table__end">
                  <button
                    type="button"
                    className="nav-button nav-button--icon dash-table__action"
                    aria-label={`Delete log ${log.id}`}
                    data-tip="Delete log"
                    onClick={() => onDelete(log)}
                  >
                    <Trash size={16} aria-hidden="true" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
