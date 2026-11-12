import React, { useState } from 'react';
import { useFitness } from '../../context/FitnessContext';

// Line chart for weight/progress progression
interface DataPoint {
  label: string;
  value: number;
  subtext?: string;
}

export const LineChart: React.FC<{
  data: DataPoint[];
  color?: string;
  unit?: string;
  height?: number;
}> = ({ data, color = '#10b981', unit = 'kg', height = 220 }) => {
  const { theme } = useFitness();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-sm text-slate-400">
        No progression entries available.
      </div>
    );
  }

  const isDark = theme === 'dark';
  const gridLineColor = isDark ? '#334155' : '#e2e8f0';
  const pointFillColor = isDark ? '#0f172a' : '#ffffff';

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values) * 0.98;
  const maxVal = Math.max(...values) * 1.02;
  const range = maxVal - minVal || 1;

  const width = 600;
  const paddingX = 40;
  const paddingY = 30;
  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingY * 2;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1 || 1)) * usableWidth;
    const y = height - paddingY - ((d.value - minVal) / range) * usableHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  // Area under line
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="relative w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible select-none"
      >
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={isDark ? 0.25 : 0.2} />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.33, 0.66, 1].map((pct, idx) => {
          const y = height - paddingY - pct * usableHeight;
          const val = (minVal + pct * range).toFixed(1);
          return (
            <g key={idx}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke={gridLineColor}
                strokeDasharray="4 4"
                strokeWidth="1"
                strokeOpacity={isDark ? 0.6 : 0.8}
              />
              <text
                x={paddingX - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-500 text-[10px] font-mono tabular-nums"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Gradient Area Fill */}
        <path d={areaD} fill="url(#chartGradient)" />

        {/* Main Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data Points */}
        {points.map((pt, i) => (
          <g
            key={i}
            className="cursor-pointer"
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoveredIdx === i ? 6 : 4}
              fill={pointFillColor}
              stroke={color}
              strokeWidth="2.5"
              className="transition-all duration-150"
            />
            {/* Label below */}
            <text
              x={pt.x}
              y={height - 8}
              textAnchor="middle"
              className="fill-slate-500 dark:fill-slate-400 text-[10px] font-medium"
            >
              {pt.label}
            </text>
          </g>
        ))}
      </svg>

      {/* Hover tooltip card */}
      {hoveredIdx !== null && (
        <div
          className="absolute pointer-events-none -translate-x-1/2 -translate-y-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs shadow-xl z-20"
          style={{
            left: `${(points[hoveredIdx].x / width) * 100}%`,
            top: `${(points[hoveredIdx].y / height) * 100}%`,
          }}
        >
          <div className="font-semibold text-slate-900 dark:text-white font-mono tabular-nums">
            {points[hoveredIdx].value} {unit}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            {points[hoveredIdx].label} {points[hoveredIdx].subtext ? `· ${points[hoveredIdx].subtext}` : ''}
          </div>
        </div>
      )}
    </div>
  );
};

// Bar chart for Daily Calories or Workouts
export const BarChart: React.FC<{
  data: { label: string; value: number; target?: number; secondary?: number }[];
  color?: string;
  targetColor?: string;
  unit?: string;
  height?: number;
}> = ({ data, color = '#10b981', targetColor = '#e2e8f0', unit = 'kcal', height = 200 }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="h-44 flex items-center justify-center text-sm text-slate-400">No data logged.</div>;
  }

  const allVals = data.flatMap((d) => [d.value, d.target || 0]);
  const maxVal = Math.max(...allVals, 10) * 1.15;

  return (
    <div className="w-full">
      <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-1 border-b border-slate-200 dark:border-slate-800">
        {data.map((item, idx) => {
          const heightPct = Math.min(100, Math.max(8, (item.value / maxVal) * 100));
          const isOverTarget = item.target ? item.value > item.target : false;

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip on hover */}
              {hoveredIdx === idx && (
                <div className="absolute -top-12 z-20 px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] whitespace-nowrap shadow-xl">
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    {item.value} {unit}
                  </span>
                  {item.target && (
                    <span className="text-slate-500 dark:text-slate-400 block text-[9px]">
                      Target: {item.target} {unit}
                    </span>
                  )}
                </div>
              )}

              {/* Target benchmark horizontal marker if present */}
              {item.target && (
                <div
                  className="absolute w-full border-t border-dashed border-slate-400/50 dark:border-slate-500/50 z-10 pointer-events-none"
                  style={{ bottom: `${(item.target / maxVal) * 100}%` }}
                />
              )}

              {/* The bar */}
              <div
                className="w-full max-w-[28px] rounded-t transition-all duration-200 group-hover:brightness-110"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: isOverTarget ? '#f59e0b' : color,
                }}
              />
              <span className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 font-medium truncate max-w-full">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Donut Chart for Macro Distribution (Carbs / Protein / Fat)
export const DonutChart: React.FC<{
  protein: number;
  carbs: number;
  fat: number;
  totalCalories: number;
}> = ({ protein, carbs, fat, totalCalories }) => {
  const { theme } = useFitness();
  const isDark = theme === 'dark';
  const baseRingColor = isDark ? '#1e293b' : '#e2e8f0';

  const totalGrams = protein + carbs + fat || 1;
  const pPct = (protein / totalGrams) * 100;
  const cPct = (carbs / totalGrams) * 100;
  const fPct = (fat / totalGrams) * 100;

  const c = 251.32;
  const pDash = (pPct / 100) * c;
  const cDash = (cPct / 100) * c;
  const fDash = (fPct / 100) * c;

  const pOffset = 0;
  const cOffset = -pDash;
  const fOffset = -(pDash + cDash);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
      <div className="relative w-40 h-40 shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Base background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke={baseRingColor}
            strokeWidth="12"
          />
          {/* Protein (Emerald) */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="#10b981"
            strokeWidth="12"
            strokeDasharray={`${pDash} ${c - pDash}`}
            strokeDashoffset={pOffset}
            className="transition-all duration-500"
          />
          {/* Carbs (Cyan) */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="#06b6d4"
            strokeWidth="12"
            strokeDasharray={`${cDash} ${c - cDash}`}
            strokeDashoffset={cOffset}
            className="transition-all duration-500"
          />
          {/* Fat (Amber) */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="#f59e0b"
            strokeWidth="12"
            strokeDasharray={`${fDash} ${c - fDash}`}
            strokeDashoffset={fOffset}
            className="transition-all duration-500"
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {totalCalories}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">kcal total</span>
        </div>
      </div>

      {/* Legend & Gram stats */}
      <div className="space-y-3 min-w-[160px]">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Protein</span>
          </div>
          <span className="font-mono tabular-nums text-slate-900 dark:text-white font-semibold">
            {protein}g ({pPct.toFixed(0)}%)
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Carbohydrates</span>
          </div>
          <span className="font-mono tabular-nums text-slate-900 dark:text-white font-semibold">
            {carbs}g ({cPct.toFixed(0)}%)
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Fats</span>
          </div>
          <span className="font-mono tabular-nums text-slate-900 dark:text-white font-semibold">
            {fat}g ({fPct.toFixed(0)}%)
          </span>
        </div>
      </div>
    </div>
  );
};
