import type { CorrelationData } from '../../hooks/useRiskMetrics';

interface CorrelationHeatmapProps {
  data: CorrelationData;
}

/** Interpolate between two hex colours at position t ∈ [0, 1]. */
function lerp(a: [number, number, number], b: [number, number, number], t: number): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r},${g},${bl})`;
}

const RED:     [number, number, number] = [255, 77,  77];
const NEUTRAL: [number, number, number] = [30,  36,  48];
const GREEN:   [number, number, number] = [0,   255, 148];

function corrColor(value: number): string {
  if (value >= 0) return lerp(NEUTRAL, GREEN, value);
  return lerp(NEUTRAL, RED, -value);
}

const CELL = 48;   // px per cell
const LABEL_W = 60; // px for row/col labels

export function CorrelationHeatmap({ data }: CorrelationHeatmapProps) {
  const { tickers, matrix } = data;
  const n = tickers.length;

  const svgW = LABEL_W + n * CELL;
  const svgH = LABEL_W + n * CELL;

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={svgW} height={svgH} style={{ display: 'block', margin: '0 auto' }}>
        {/* Column labels */}
        {tickers.map((t, j) => (
          <text
            key={`col-${j}`}
            x={LABEL_W + j * CELL + CELL / 2}
            y={LABEL_W - 8}
            textAnchor="middle"
            style={{ fontSize: 10, fill: '#8B949E', fontFamily: 'JetBrains Mono' }}
          >
            {t}
          </text>
        ))}

        {/* Row labels + cells */}
        {tickers.map((t, i) => (
          <g key={`row-${i}`}>
            <text
              x={LABEL_W - 8}
              y={LABEL_W + i * CELL + CELL / 2 + 4}
              textAnchor="end"
              style={{ fontSize: 10, fill: '#8B949E', fontFamily: 'JetBrains Mono' }}
            >
              {t}
            </text>
            {matrix[i].map((val, j) => (
              <g key={`cell-${i}-${j}`}>
                <rect
                  x={LABEL_W + j * CELL}
                  y={LABEL_W + i * CELL}
                  width={CELL - 2}
                  height={CELL - 2}
                  rx={4}
                  fill={corrColor(val)}
                />
                <text
                  x={LABEL_W + j * CELL + CELL / 2 - 1}
                  y={LABEL_W + i * CELL + CELL / 2 + 4}
                  textAnchor="middle"
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    fill: Math.abs(val) > 0.4 ? '#0F1117' : '#E6EDF3',
                    fontFamily: 'JetBrains Mono',
                  }}
                >
                  {val.toFixed(2)}
                </text>
              </g>
            ))}
          </g>
        ))}
      </svg>

      {/* Scale legend — paddingLeft: LABEL_W shifts center to align with cell grid */}
      <div className="flex items-center justify-center gap-3 mt-3" style={{ paddingLeft: LABEL_W }}>
        <span style={{ color: '#FF4D4D', fontSize: 11 }}>−1 Negative</span>
        <div
          style={{
            width: 80,
            height: 6,
            borderRadius: 3,
            background: 'linear-gradient(to right, #FF4D4D, #1E2430, #00FF94)',
          }}
        />
        <span style={{ color: '#00FF94', fontSize: 11 }}>+1 Positive</span>
      </div>
    </div>
  );
}
