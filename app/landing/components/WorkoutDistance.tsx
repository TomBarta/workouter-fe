import { JSX } from "react";

interface WorkoutDistanceProps {
  distanceValue?: number;
  distanceUnit?: string;
  onChange: (value: { distanceValue?: number; distanceUnit?: string }) => void;
}

const distanceUnits = [
  { value: 'yd', label: 'yd' },
  { value: 'mi', label: 'mi' },
  { value: 'm', label: 'm' },
  { value: 'km', label: 'km' },
];

export function WorkoutDistance({
  distanceValue,
  distanceUnit = 'm',
  onChange
}: WorkoutDistanceProps): JSX.Element {
  const handleValueChange = (value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    onChange({ distanceValue: numValue, distanceUnit });
  };

  const handleUnitChange = (unit: string) => {
    onChange({ distanceValue, distanceUnit: unit });
  };

  return (
    <div className="form-control w-full">
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="number"
            step="0.1"
            min="0"
            value={distanceValue || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            className="input input-bordered w-full text-lg border-wktr-gray-300 focus:border-wktr-orange-500 focus:ring-2 focus:ring-wktr-orange-500/20 focus:outline-none transition-colors duration-200"
            placeholder="distance"
          />
        </div>

        <div className="w-1/3">
          <select
            value={distanceUnit}
            onChange={(e) => handleUnitChange(e.target.value)}
            className="select select-bordered w-full text-lg border-wktr-gray-300 focus:border-wktr-orange-500 focus:ring-2 focus:ring-wktr-orange-500/20 focus:outline-none transition-colors duration-200"
          >
            {distanceUnits.map((unit) => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}