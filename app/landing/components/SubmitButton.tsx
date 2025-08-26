import { JSX } from "react";

interface SubmitButtonProps {
    disabled?: boolean;
    variant?: 'light' | 'dark';
}

export const SubmitButton = ({ disabled = true, variant = 'light' }: SubmitButtonProps): JSX.Element => {
    const getButtonClasses = () => {
        if (disabled) {
            return 'bg-workouter-gray-400 text-workouter-gray-600 cursor-not-allowed';
        }

        if (variant === 'dark') {
            return 'bg-wktr-black-950 text-wktr-gray-300 hover:bg-wktr-black-900 hover:text-wktr-gray-300 border-none';
        }

        // Light variant (default)
        return 'btn-brand';
    };

    return (
        <div className="w-full max-w-md">
            <button
                type="submit"
                className={`btn btn-lg w-full transition-all duration-200 ${getButtonClasses()}`}
                disabled={disabled}
            >
                Create Workout
            </button>
        </div>
    );
};
