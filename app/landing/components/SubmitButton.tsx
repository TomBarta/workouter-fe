interface SubmitButtonProps {
    disabled?: boolean;
}

export const SubmitButton = ({ disabled = true }: SubmitButtonProps): JSX.Element => (
    <div className="w-full max-w-md">
        <button
            type="submit"
            className={`btn btn-primary btn-lg w-full ${disabled ? 'btn-disabled' : ''}`}
            disabled={disabled}
        >
            Create Workout
        </button>
    </div>
);
