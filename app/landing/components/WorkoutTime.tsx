import { JSX } from "react";

interface WorkoutTimeProps {
  timeHours?: number;
  timeMinutes?: number;
  timeSeconds?: number;
  onChange: (value: { timeHours?: number; timeMinutes?: number; timeSeconds?: number }) => void;
}

export function WorkoutTime({
  timeHours,
  timeMinutes,
  timeSeconds,
  onChange
}: WorkoutTimeProps): JSX.Element {
  const handleHoursChange = (value: string) => {
    const numValue = value === '' ? undefined : parseInt(value);
    onChange({ timeHours: numValue, timeMinutes, timeSeconds });
  };

  const handleMinutesChange = (value: string) => {
    const numValue = value === '' ? undefined : parseInt(value);
    onChange({ timeHours, timeMinutes: numValue, timeSeconds });
  };

  const handleSecondsChange = (value: string) => {
    const numValue = value === '' ? undefined : parseInt(value);
    onChange({ timeHours, timeMinutes, timeSeconds: numValue });
  };

  return (
    <div className="form-control w-full">
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="number"
            step="1"
            min="0"
            max="23"
            value={timeHours || ''}
            onChange={(e) => handleHoursChange(e.target.value)}
            className="input input-bordered w-full text-lg border-wktr-gray-300 focus:border-wktr-orange-500 focus:ring-2 focus:ring-wktr-orange-500/20 focus:outline-none transition-colors duration-200"
            placeholder="hr"
          />
        </div>

        <div className="flex-1">
          <input
            type="number"
            step="1"
            min="0"
            max="59"
            value={timeMinutes || ''}
            onChange={(e) => handleMinutesChange(e.target.value)}
            className="input input-bordered w-full text-lg border-wktr-gray-300 focus:border-wktr-orange-500 focus:ring-2 focus:ring-wktr-orange-500/20 focus:outline-none transition-colors duration-200"
            placeholder="min"
          />
        </div>

        <div className="flex-1">
          <input
            type="number"
            step="1"
            min="0"
            max="59"
            value={timeSeconds || ''}
            onChange={(e) => handleSecondsChange(e.target.value)}
            className="input input-bordered w-full text-lg border-wktr-gray-300 focus:border-wktr-orange-500 focus:ring-2 focus:ring-wktr-orange-500/20 focus:outline-none transition-colors duration-200"
            placeholder="sec"
          />
        </div>
      </div>
    </div>
  );
}