import React from 'react';

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function DatePicker({ label, ...props }: DatePickerProps) {
  return (
    <label className="flex flex-col text-sm text-slate-300">
      {label ? <span className="mb-1 text-xs uppercase tracking-wide text-slate-400">{label}</span> : null}
      <input
        type="date"
        className="rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        {...props}
      />
    </label>
  );
}

export default DatePicker;

