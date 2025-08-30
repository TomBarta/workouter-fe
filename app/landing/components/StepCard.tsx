import { DistanceUnits, EnergyUnits, WorkoutGoalTypes, IntervalStepPurpose } from "@/app/utils/workouts";
import { Step } from "./types";
import { WorkoutDistance } from "./WorkoutDistance";
import { WorkoutCalorie } from "./WorkoutCalorie";
import { WorkoutTime } from "./WorkoutTime";
import { JSX } from "react";

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
        <div className={`card-workout h-80 ${step.purpose === IntervalStepPurpose.recovery
            ? 'border-wktr-blue-300'
            : 'border-wktr-orange-300'
            }`}>
            <div>
                <div className="flex justify-between items-start mb-3">
                    <h4 className={`card-title text-lg font-semibold ${step.purpose === IntervalStepPurpose.recovery
                        ? 'text-wktr-gold-700'
                        : 'text-wktr-black-900'
                        }`}>
                        {step.purpose === IntervalStepPurpose.recovery ? 'Recovery' : 'Work'}
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
                    <div className="flex gap-4">
                        <label className="label cursor-pointer gap-2">
                            <input
                                type="radio"
                                checked={step.purpose === IntervalStepPurpose.work}
                                onChange={() => updateStep({ purpose: IntervalStepPurpose.work })}
                                className="radio radio-primary border-wktr-gray-300 checked:border-wktr-orange-500 checked:bg-wktr-orange-500"
                            />
                            <span className="label-text text-wktr-black-600">Work</span>
                        </label>
                        <label className="label cursor-pointer gap-2">
                            <input
                                type="radio"
                                checked={step.purpose === IntervalStepPurpose.recovery}
                                onChange={() => updateStep({ purpose: IntervalStepPurpose.recovery })}
                                className="radio radio-primary border-wktr-gray-300 checked:border-wktr-blue-500 checked:bg-wktr-blue-500"
                            />
                            <span className="label-text text-wktr-black-600">Recovery</span>
                        </label>
                    </div>
                </div>

                {/* Goal inputs for work steps */}
                {step.purpose === IntervalStepPurpose.work && (
                    <div className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium text-wktr-black-700">Goal Type</span>
                            </label>
                            <select
                                value={step.goalType || ''}
                                onChange={(e) => updateStep({ goalType: e.target.value as WorkoutGoalTypes })}
                                className="select select-bordered w-full border-wktr-gray-300 focus:border-wktr-orange-500 focus:ring-2 focus:ring-wktr-orange-500/20 focus:outline-none transition-colors duration-200"
                            >
                                <option value="">Select goal...</option>
                                <option value={WorkoutGoalTypes.open}>Open</option>
                                <option value={WorkoutGoalTypes.distance}>Distance</option>
                                <option value={WorkoutGoalTypes.energy}>Calories</option>
                                <option value={WorkoutGoalTypes.time}>Time</option>
                            </select>
                        </div>

                        {/* Distance goal */}
                        {step.goalType === WorkoutGoalTypes.distance && (
                            <WorkoutDistance
                                distanceValue={step.distanceValue}
                                distanceUnit={step.distanceUnit as DistanceUnits}
                                onChange={({ distanceValue, distanceUnit }) =>
                                    updateStep({ distanceValue, distanceUnit })
                                }
                            />
                        )}

                        {/* Calories goal */}
                        {step.goalType === WorkoutGoalTypes.energy && (
                            <WorkoutCalorie
                                calorieValue={step.caloriesValue}
                                calorieUnit={step.caloriesUnit as EnergyUnits}
                                onChange={({ calorieValue, calorieUnit }) =>
                                    updateStep({ caloriesValue: calorieValue, caloriesUnit: calorieUnit })
                                }
                            />
                        )}

                        {/* Time goal */}
                        {step.goalType === WorkoutGoalTypes.time && (
                            <WorkoutTime
                                timeHours={step.timeHours}
                                showHours={false}
                                timeMinutes={step.timeMinutes}
                                timeSeconds={step.timeSeconds}
                                onChange={({ timeHours, timeMinutes, timeSeconds }) =>
                                    updateStep({ timeHours, timeMinutes, timeSeconds })
                                }
                            />
                        )}
                    </div>
                )}

                {/* Recovery time input */}
                {step.purpose === IntervalStepPurpose.recovery && (
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium text-wktr-black-700">Recovery Duration</span>
                        </label>
                        <WorkoutTime
                            timeHours={step.timeHours}
                            timeMinutes={step.timeMinutes}
                            timeSeconds={step.timeSeconds}
                            showHours={false}
                            onChange={({ timeHours, timeMinutes, timeSeconds }) =>
                                updateStep({ timeHours, timeMinutes, timeSeconds })
                            }
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
