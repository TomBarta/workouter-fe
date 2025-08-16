import { activities } from "@/app/utils/workouts";

interface SportSelectorProps {
    value: string;
    onChange: (value: string) => void;
}

export const SportSelector = ({ value, onChange }: SportSelectorProps): JSX.Element => (
    <div className="w-full max-w-md">
        <label className="form-control w-full">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="select select-bordered w-full text-lg border-workouter-gray-300 focus:border-workouter-orange-500 focus:ring-2 focus:ring-workouter-orange-500/20 focus:outline-none transition-colors duration-200"
                required
            >
                <option value="">Sport...</option>
                {activities().map(([value, activity]) => (
                    <option key={value} value={value}>{activity}</option>
                ))}
            </select>
        </label>
    </div>
);
