import { useId } from "react";

type Series = { key: string; label: string; color: string };
type Row = { label: string; values: Record<string, number> };

export function FinanceBarChart({
  title,
  currency,
  rows,
  series,
}: {
  title: string;
  currency: string;
  rows: Row[];
  series: Series[];
}) {
  const id = useId();
  const values = rows.flatMap((row) =>
    series.map((s) => row.values[s.key] || 0),
  );
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const range = max - min || 1;
  const width = Math.max(640, rows.length * 100 + 100);
  const left = 85;
  const plotWidth = width - left - 20;
  const y = (value: number) => 220 - ((value - min) / range) * 190;
  const group = plotWidth / Math.max(1, rows.length);
  const bar = Math.min(24, (group - 16) / series.length);
  const format = (value: number) =>
    value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return (
    <section className="min-w-0 space-y-3 rounded-lg border p-4">
      <h3 id={id} className="font-semibold">
        {title} · {currency}
      </h3>
      <div className="flex flex-wrap gap-4 text-xs">
        {series.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: s.color }}
            />
            {s.label}
          </span>
        ))}
      </div>
      {rows.length <= 2 && (
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm tabular-nums">
          {rows.map((row) => (
            <span key={row.label}>
              {row.label}:{" "}
              {series
                .map((s) => `${format(row.values[s.key] || 0)} ${currency}`)
                .join(" / ")}
            </span>
          ))}
        </div>
      )}
      <div
        className="overflow-x-auto"
        tabIndex={0}
        role="region"
        aria-labelledby={id}
      >
        <svg
          viewBox={`0 0 ${width} 290`}
          className="w-full min-w-[640px] text-muted-foreground"
          role="img"
          aria-labelledby={id}
          direction="ltr"
        >
          <desc>
            {rows
              .map(
                (row) =>
                  `${row.label}: ${series.map((s) => `${s.label} ${format(row.values[s.key] || 0)} ${currency}`).join(", ")}`,
              )
              .join("; ")}
          </desc>
          {[0, 1, 2, 3, 4].map((tick) => {
            const value = min + (range * tick) / 4;
            return (
              <g key={tick}>
                <line
                  x1={left}
                  x2={width - 20}
                  y1={y(value)}
                  y2={y(value)}
                  stroke="currentColor"
                  opacity="0.15"
                />
                <text
                  x={left - 10}
                  y={y(value) + 4}
                  textAnchor="end"
                  fill="currentColor"
                  fontSize="11"
                >
                  {new Intl.NumberFormat(undefined, {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }).format(value)}
                </text>
              </g>
            );
          })}
          <line
            x1={left}
            x2={width - 20}
            y1={y(0)}
            y2={y(0)}
            stroke="currentColor"
            opacity="0.5"
          />
          {rows.map((row, index) => (
            <g key={`${row.label}:${index}`}>
              {series.map((s, seriesIndex) => {
                const value = row.values[s.key] || 0;
                return (
                  <rect
                    key={s.key}
                    x={
                      left +
                      group * (index + 0.5) +
                      (seriesIndex - series.length / 2) * bar
                    }
                    y={Math.min(y(value), y(0))}
                    width={bar - 3}
                    height={Math.abs(y(value) - y(0))}
                    rx="2"
                    fill={s.color}
                  >
                    <title>
                      {row.label} · {s.label}: {format(value)} {currency}
                    </title>
                  </rect>
                );
              })}
              <text
                x={left + group * (index + 0.5)}
                y={245}
                textAnchor="middle"
                fill="currentColor"
                fontSize="11"
              >
                <title>{row.label}</title>
                {row.label.length > 16
                  ? `${row.label.slice(0, 15)}…`
                  : row.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}
