import { DistanceUnits, EnergyUnits } from "@/app/utils/workouts";
import { Step } from "./types";

interface StepCardProps {
    step: Step;
    onUpdate: (step: Step) => void;
    onRemove: () => void;
    canRemove: boolean;
}

export const StepCard = ({
    step,
    onUpdate,
    onRemove,
    canRemove
}: StepCardProps): JSX.Element => {
    const updateStep = (updates: Partial<Step>) => {
        onUpdate({ ...step, ...updates });
    };

    return (
        <div className={`card-workout ${step.purpose === 'recovery'
            ? 'border-workouter-gold-300 bg-workouter-gold-50'
            : 'border-workouter-gray-300'
            }`}>
            <div className="card-body p-4">
                <div className="flex justify-between items-start mb-3">
                    <h4 className={`card-title text-lg font-semibold ${step.purpose === 'recovery'
                        ? 'text-workouter-gold-700'
                        : 'text-workouter-black-900'
                        }`}>
                        {step.purpose === 'recovery' ? 'Recovery' : 'Work'}
                    </h4>
                    {canRemove && (
                        <button
                            type="button"
                            onClick={onRemove}
                            className="btn btn-ghost btn-sm text-error-500 hover:text-error-600 hover:bg-error-50 transition-colors duration-200"
                        >
                            Remove
                        </button>
                    )}
                </div>

                {/* Purpose selector */}
                <div className="form-control mb-4">
                    <label className="label">
                        <span className="label-text font-medium text-workouter-black-700">Purpose</span>
                    </label>
                    <div className="flex gap-4">
                        <label className="label cursor-pointer gap-2">
                            <input
                                type="radio"
                                checked={step.purpose === 'work'}
                                onChange={() => updateStep({ purpose: 'work' })}
                                className="radio radio-primary border-workouter-gray-300 checked:border-workouter-orange-500 checked:bg-workouter-orange-500"
                            />
                            <span className="label-text text-workouter-black-600">Work</span>
                        </label>
                        <label className="label cursor-pointer gap-2">
                            <input
                                type="radio"
                                checked={step.purpose === 'recovery'}
                                onChange={() => updateStep({ purpose: 'recovery' })}
                                className="radio radio-primary border-workouter-gray-300 checked:border-workouter-orange-500 checked:bg-workouter-orange-500"
                            />
                            <span className="label-text text-workouter-black-600">Recovery</span>
                        </label>
                    </div>
                </div>

                {/* Goal inputs for work steps */}
                {step.purpose === 'work' && (
                    <div className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium text-workouter-black-700">Goal Type</span>
                            </label>
                            <select
                                value={step.goalType || ''}
                                onChange={(e) => updateStep({ goalType: e.target.value as 'distance' | 'calories' | 'time' | 'open' })}
                                className="select select-bordered w-full border-workouter-gray-300 focus:border-workouter-orange-500 focus:ring-2 focus:ring-workouter-orange-500/20 focus:outline-none transition-colors duration-200"
                            >
                                <option value="">Select goal...</option>
                                <option value="open">Open</option>
                                <option value="distance">Distance</option>
                                <option value="calories">Calories</option>
                                <option value="time">Time</option>
                            </select>
                        </div>

                        {/* Distance goal */}
                        {step.goalType === 'distance' && (
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    min={0}
                                    step="0.1"
                                    placeholder="Distance"
                                    value={step.distanceValue || ''}
                                    onChange={(e) => updateStep({ distanceValue: parseFloat(e.target.value) || undefined })}
                                    className="input input-bordered flex-1 border-workouter-gray-300 focus:border-workouter-orange-500 focus:ring-2 focus:ring-workouter-orange-500/20 focus:outline-none transition-colors duration-200"
                                />
                                <select
                                    value={step.distanceUnit || ''}
                                    onChange={(e) => updateStep({ distanceUnit: e.target.value })}
                                    className="select select-bordered w-32 border-workouter-gray-300 focus:border-workouter-orange-500 focus:ring-2 focus:ring-workouter-orange-500/20 focus:outline-none transition-colors duration-200"
                                >
                                    <option value="">Unit</option>
                                    <option value={DistanceUnits.miles}>Miles</option>
                                    <option value={DistanceUnits.kilometers}>Kilometers</option>
                                    <option value={DistanceUnits.yards}>Yards</option>
                                    <option value={DistanceUnits.meters}>Meters</option>
                                </select>
                            </div>
                        )}

                        {/* Calories goal */}
                        {step.goalType === 'calories' && (
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    min={0}
                                    placeholder="Calories"
                                    value={step.caloriesValue || ''}
                                    onChange={(e) => updateStep({ caloriesValue: parseInt(e.target.value) || undefined })}
                                    className="input input-bordered flex-1 border-workouter-gray-300 focus:border-workouter-orange-500 focus:ring-2 focus:ring-workouter-orange-500/20 focus:outline-none transition-colors duration-200"
                                />
                                <select
                                    value={step.caloriesUnit || ''}
                                    onChange={(e) => updateStep({ caloriesUnit: e.target.value })}
                                    className="select select-bordered w-32 border-workouter-gray-300 focus:border-workouter-orange-500 focus:ring-2 focus:ring-workouter-orange-500/20 focus:outline-none transition-colors duration-200"
                                >
                                    <option value="">Unit</option>
                                    <option value={EnergyUnits.calories}>Calories</option>
                                    <option value={EnergyUnits.kilocalories}>Kilocalories</option>
                                </select>
                            </div>
                        )}

                        {/* Time goal */}
                        {step.goalType === 'time' && (
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    min={0}
                                    max={23}
                                    placeholder="Hours"
                                    value={step.timeHours || ''}
                                    onChange={(e) => updateStep({ timeHours: parseInt(e.target.value) || undefined })}
                                    className="input input-bordered w-20 border-workouter-gray-300 focus:border-workouter-orange-500 focus:ring-2 focus:ring-workouter-orange-500/20 focus:outline-none transition-colors duration-200"
                                />
                                <input
                                    type="number"
                                    min={0}
                                    max={59}
                                    placeholder="Minutes"
                                    value={step.timeMinutes || ''}
                                    onChange={(e) => updateStep({ timeMinutes: parseInt(e.target.value) || undefined })}
                                    className="input input-bordered w-20 border-workouter-gray-300 focus:border-workouter-orange-500 focus:ring-2 focus:ring-workouter-orange-500/20 focus:outline-none transition-colors duration-200"
                                />
                                <input
                                    type="number"
                                    min={0}
                                    max={59}
                                    placeholder="Seconds"
                                    value={step.timeSeconds || ''}
                                    onChange={(e) => updateStep({ timeSeconds: parseInt(e.target.value) || undefined })}
                                    className="input input-bordered w-20 border-workouter-gray-300 focus:border-workouter-orange-500 focus:ring-2 focus:ring-workouter-orange-500/20 focus:outline-none transition-colors duration-200"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Recovery time input */}
                {step.purpose === 'recovery' && (
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium text-workouter-black-700">Recovery Duration</span>
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                min={0}
                                max={59}
                                placeholder="Minutes"
                                value={step.timeMinutes || ''}
                                onChange={(e) => updateStep({ timeMinutes: parseInt(e.target.value) || undefined })}
                                className="input input-bordered w-20 border-workouter-gray-300 focus:border-workouter-orange-500 focus:ring-2 focus:ring-workouter-orange-500/20 focus:outline-none transition-colors duration-200"
                            />
                            <input
                                type="number"
                                min={0}
                                max={59}
                                placeholder="Seconds"
                                value={step.timeSeconds || ''}
                                onChange={(e) => updateStep({ timeSeconds: parseInt(e.target.value) || undefined })}
                                className="input input-bordered w-20 border-workouter-gray-300 focus:border-workouter-orange-500 focus:ring-2 focus:ring-workouter-orange-500/20 focus:outline-none transition-colors duration-200"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
