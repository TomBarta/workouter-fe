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
                className="input input-bordered w-full text-lg"
                required
            />
        </label>
    </div>
);
