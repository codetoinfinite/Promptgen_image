import { useEffect, useRef } from 'react';

export default function ForgeLog({ lines }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  return (
    <div className="mt-8 border border-border rounded bg-surface p-4 md:p-5 font-mono text-[12px]">
      <div className="text-text-3 text-[10px] tracking-[0.15em] uppercase mb-3">FORGE LOG</div>
      <div className="space-y-1.5 min-h-[80px]">
        {lines.map((line, i) => (
          <div
            key={i}
            className="text-text-2 forge-log-line"
            style={{ animationDelay: `${i * 20}ms` }}
          >
            <span className="text-accent mr-1">{'>'}</span>
            {line.replace(/^> /, '')}
          </div>
        ))}
        {lines.length > 0 && (
          <span className="inline-block w-2 h-3.5 bg-accent ml-1 cursor-blink align-middle" />
        )}
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
