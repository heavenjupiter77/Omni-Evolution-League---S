import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface ThemeStepperProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

export const ThemeStepper: React.FC<ThemeStepperProps> = ({
  id,
  value,
  onChange,
  min = 1,
  max = 9999,
  step = 1,
  label,
}) => {
  const handleDecrement = () => {
    const next = Math.max(min, value - step);
    onChange(next);
  };

  const handleIncrement = () => {
    const next = Math.min(max, value + step);
    onChange(next);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      onChange(Math.max(min, Math.min(max, val)));
    }
  };

  return (
    <div className="flex items-center gap-1.5" id={id}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        className="w-8 h-8 rounded-lg bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 hover:bg-cyan-950/60 hover:shadow-[0_0_12px_rgba(6,182,212,0.35)] active:bg-cyan-900 text-cyan-300 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer"
        aria-label="Decrease value"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          className="w-16 h-8 text-center bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono text-white font-bold focus:border-cyan-400 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        className="w-8 h-8 rounded-lg bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 hover:bg-cyan-950/60 hover:shadow-[0_0_12px_rgba(6,182,212,0.35)] active:bg-cyan-900 text-cyan-300 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer"
        aria-label="Increase value"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>

      {label && <span className="text-xs font-mono text-slate-400 ml-1.5">{label}</span>}
    </div>
  );
};
