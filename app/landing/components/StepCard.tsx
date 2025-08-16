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
        <div className={`card bg-base-100 shadow-lg border-2 ${step.purpose === 'recovery'
            ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300'
            }`}>
            <div className="card-body p-4">
                <div className="flex justify-between items-start mb-3">
                    <h4 className={`card-title text-lg ${step.purpose === 'recovery'
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-gray-900 dark:text-gray-100'
                        }`}>
                        {step.purpose === 'recovery' ? 'Recovery' : 'Work'}
                    </h4>
                    {canRemove && (
                        <button
                            type="button"
                            onClick={onRemove}
                            className="btn btn-ghost btn-sm text-red-500 hover:text-red-700"
                        >
                            Remove
                        </button>
                    )}
                </div>

                {/* Purpose selector */}
                <div className="form-control mb-4">
                    <label className="label">
                        <span className="label-text font-medium">Purpose</span>
                    </label>
                    <div className="flex gap-4">
                        <label className="label cursor-pointer gap-2">
                            <input
                                type="radio"
                                checked={step.purpose === 'work'}
                                onChange={() => updateStep({ purpose: 'work' })}
                                className="radio radio-primary"
                            />
                            <span className="label-text">Work</span>
                        </label>
                        <label className="label cursor-pointer gap-2">
                            <input
                                type="radio"
                                checked={step.purpose === 'recovery'}
                                onChange={() => updateStep({ purpose: 'recovery' })}
                                className="radio radio-primary"
                            />
                            <span className="label-text">Recovery</span>
                        </label>
                    </div>
                </div>

                {/* Goal inputs for work steps */}
                {step.purpose === 'work' && (
                    <div className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Goal Type</span>
                            </label>
                            <select
                                value={step.goalType || ''}
                                onChange={(e) => updateStep({ goalType: e.target.value as 'distance' | 'calories' | 'time' | 'open' })}
                                className="select select-bordered w-full"
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
                                    className="input input-bordered flex-1"
                                />
                                <select
                                    value={step.distanceUnit || ''}
                                    onChange={(e) => updateStep({ distanceUnit: e.target.value })}
                                    className="select select-bordered w-32"
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
                                    className="input input-bordered flex-1"
                                />
                                <select
                                    value={step.caloriesUnit || ''}
                                    onChange={(e) => updateStep({ caloriesUnit: e.target.value })}
                                    className="select select-bordered w-32"
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
                                    className="input input-bordered w-20"
                                />
                                <input
                                    type="number"
                                    min={0}
                                    max={59}
                                    placeholder="Minutes"
                                    value={step.timeMinutes || ''}
                                    onChange={(e) => updateStep({ timeMinutes: parseInt(e.target.value) || undefined })}
                                    className="input input-bordered w-20"
                                />
                                <input
                                    type="number"
                                    min={0}
                                    max={59}
                                    placeholder="Seconds"
                                    value={step.timeSeconds || ''}
                                    onChange={(e) => updateStep({ timeSeconds: parseInt(e.target.value) || undefined })}
                                    className="input input-bordered w-20"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Recovery time input */}
                {step.purpose === 'recovery' && (
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Recovery Duration</span>
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                min={0}
                                max={59}
                                placeholder="Minutes"
                                value={step.timeMinutes || ''}
                                onChange={(e) => updateStep({ timeMinutes: parseInt(e.target.value) || undefined })}
                                className="input input-bordered w-20"
                            />
                            <input
                                type="number"
                                min={0}
                                max={59}
                                placeholder="Seconds"
                                value={step.timeSeconds || ''}
                                onChange={(e) => updateStep({ timeSeconds: parseInt(e.target.value) || undefined })}
                                className="input input-bordered w-20"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
