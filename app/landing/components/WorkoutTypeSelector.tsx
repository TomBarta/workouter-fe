interface WorkoutTypeSelectorProps {
    value: string;
    onChange: (value: string) => void;
}

export const WorkoutTypeSelector = ({ value, onChange }: WorkoutTypeSelectorProps): JSX.Element => (
    <div className="w-full max-w-md">
        <label className="form-control w-full">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="select select-bordered w-full text-lg border-workouter-gray-300 focus:border-workouter-orange-500 focus:ring-2 focus:ring-workouter-orange-500/20 focus:outline-none transition-colors duration-200"
                required
            >
                <option value="">Workout type...</option>
                <option value="open">Open Goal</option>
                <option value="distance">Distance</option>
                <option value="calories">Calories</option>
                <option value="time">Time</option>
                <option value="custom">Custom Interval</option>
            </select>
        </label>
    </div>
);
