interface WorkoutNameInputProps {
    value: string;
    onChange: (value: string) => void;
}

export const WorkoutNameInput = ({ value, onChange }: WorkoutNameInputProps): JSX.Element => (
    <div className="w-full max-w-md">
        <label className="form-control w-full">
            <input
                name="displayName"
                type="text"
                placeholder="Workout name"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="input input-bordered w-full text-lg border-workouter-gray-300 focus:border-workouter-orange-500 focus:ring-2 focus:ring-workouter-orange-500/20 focus:outline-none transition-colors duration-200"
                required
            />
        </label>
    </div>
);
