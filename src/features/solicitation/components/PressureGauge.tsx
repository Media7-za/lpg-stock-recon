interface PressureGaugeProps {
  daysOverdue: number;
}

const TICKS = [0, 10, 20, 30, 40, 50, 60];

export function PressureGauge({ daysOverdue }: PressureGaugeProps) {
  const clamped = Math.max(0, Math.min(daysOverdue, 60));
  const angle = -90 + (clamped / 60) * 180;
  const color = clamped < 10 ? '#4A90A4' : clamped < 25 ? '#E8963D' : '#B85C4A';

  return (
    <div className="flex flex-col items-center w-[148px]">
      <svg width="148" height="90" viewBox="0 0 148 90">
        <path d="M 14 82 A 60 60 0 0 1 134 82" fill="none" stroke="#34333A" strokeWidth="10" strokeLinecap="round" />
        <path
          d="M 14 82 A 60 60 0 0 1 134 82"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${(clamped / 60) * 188.5} 188.5`}
          style={{ transition: 'stroke-dasharray 0.4s ease, stroke 0.4s ease' }}
        />
        {TICKS.map((t) => {
          const a = (-90 + (t / 60) * 180) * (Math.PI / 180);
          const x1 = 74 + 50 * Math.cos(a - Math.PI / 2);
          const y1 = 82 + 50 * Math.sin(a - Math.PI / 2);
          const x2 = 74 + 58 * Math.cos(a - Math.PI / 2);
          const y2 = 82 + 58 * Math.sin(a - Math.PI / 2);
          return <line key={t} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4A4944" strokeWidth="1.5" />;
        })}
        <g style={{ transition: 'transform 0.4s ease', transformOrigin: '74px 82px' }} transform={`rotate(${angle} 74 82)`}>
          <line x1="74" y1="82" x2="74" y2="34" stroke="#F2EEE6" strokeWidth="2" />
          <circle cx="74" cy="82" r="4" fill="#F2EEE6" />
        </g>
      </svg>
      <div className="-mt-1.5 text-center font-mono text-xl font-semibold leading-none" style={{ color }}>
        {daysOverdue}
      </div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-text-secondary">days overdue</div>
    </div>
  );
}
