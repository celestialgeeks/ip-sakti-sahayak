"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      min = 0,
      max = 100,
      step = 1,
      value,
      defaultValue = 0,
      disabled,
      onValueChange,
      onChange,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState<number>(
      value !== undefined ? value : defaultValue
    );

    const currentValue = value !== undefined ? value : internalValue;
    const percentage = Math.min(
      100,
      Math.max(0, ((currentValue - min) / (max - min)) * 100)
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = parseFloat(e.target.value);
      if (value === undefined) {
        setInternalValue(next);
      }
      onValueChange?.(next);
      onChange?.(e);
    };

    return (
      <div
        className={cn(
          "relative flex w-full touch-none select-none items-center py-2",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-100 border border-slate-200 shadow-2xs">
          <div
            className="h-full bg-gradient-to-r from-tiranga-saffron to-tiranga-saffron-deep transition-all duration-75 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-4.5 w-4.5 rounded-full border-2 border-tiranga-saffron bg-white shadow-sm transition-transform pointer-events-none hover:scale-110",
            disabled && "border-slate-400 bg-slate-100"
          )}
          style={{ left: `${percentage}%` }}
        >
          <div className="h-1.5 w-1.5 rounded-full bg-tiranga-saffron-deep m-auto mt-1" />
        </div>
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          disabled={disabled}
          onChange={handleChange}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          {...props}
        />
      </div>
    );
  }
);

Slider.displayName = "Slider";

export { Slider };
