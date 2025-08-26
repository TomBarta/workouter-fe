import { JSX } from "react";
import { EnergyUnits } from "@/app/utils/workouts";

interface WorkoutCalorieProps {
  calorieValue?: number;
  calorieUnit?: EnergyUnits;
  onChange: (value: { calorieValue?: number; calorieUnit?: EnergyUnits }) => void;
}

const calorieUnits = [
  { value: EnergyUnits.calories, label: 'cal' },
  { value: EnergyUnits.kilocalories, label: 'kcal' },
];

export function WorkoutCalorie({ 
  calorieValue, 
  calorieUnit = EnergyUnits.calories, 
  onChange 
}: WorkoutCalorieProps): JSX.Element {
  const handleValueChange = (value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    onChange({ calorieValue: numValue, calorieUnit });
  };

  const handleUnitChange = (unit: string) => {
    onChange({ calorieValue, calorieUnit: unit as EnergyUnits });
  };

  return (
    <div className="form-control w-full">
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="number"
            step="1"
            min="0"
            value={calorieValue || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            className="input input-bordered w-full text-lg border-wktr-gray-300 focus:border-wktr-orange-500 focus:ring-2 focus:ring-wktr-orange-500/20 focus:outline-none transition-colors duration-200"
            placeholder="calories"
          />
        </div>
        
        <div className="w-1/3">
          <select
            value={calorieUnit}
            onChange={(e) => handleUnitChange(e.target.value)}
            className="select select-bordered w-full text-lg border-wktr-gray-300 focus:border-wktr-orange-500 focus:ring-2 focus:ring-wktr-orange-500/20 focus:outline-none transition-colors duration-200"
          >
            {calorieUnits.map((unit) => (
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