interface SubmitButtonProps {
    disabled?: boolean;
}

export const SubmitButton = ({ disabled = true }: SubmitButtonProps): JSX.Element => (
    <div className="w-full max-w-md">
        <button
            type="submit"
            className={`btn btn-lg w-full transition-all duration-200 ${disabled
                    ? 'bg-workouter-gray-400 text-workouter-gray-600 cursor-not-allowed'
                    : 'btn-brand hover:scale-105 active:scale-95'
                }`}
            disabled={disabled}
        >
            Create Workout
        </button>
    </div>
);
