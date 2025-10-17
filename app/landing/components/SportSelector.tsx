import { JSX } from "react";
import { activities, HKWorkoutActivityType } from "@/app/utils/workouts";

interface SportSelectorProps {
    value: HKWorkoutActivityType | '';
    onChange: (value: HKWorkoutActivityType | '') => void;
}

export const SportSelector = ({ value, onChange }: SportSelectorProps): JSX.Element => (
    <div className="w-full max-w-md">
        <label className="form-control w-full hidden sr-only">
            <div className="label">
                <span className="label-text text-lg font-semibold text-wktr-black-700">Sport</span>
            </div>
        </label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value as HKWorkoutActivityType | '')}
            className="select select-bordered w-full text-lg border-wktr-gray-300 focus:border-wktr-orange-500 focus:ring-2 focus:ring-wktr-orange-500/20 focus:outline-none transition-colors duration-200"
            required
        >
            <option value="">Select Sport</option>
            {activities().map(([value, activity]) => (
                <option key={value} value={value}>{activity}</option>
            ))}
        </select>
    </div>
);
