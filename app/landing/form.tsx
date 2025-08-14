import { createWorkout } from "@/app/lib/actions";
import { activities, DistanceUnits, EnergyUnits, TimeUnits, workoutGoals, WorkoutGoalTypes, WorkoutPlan, workoutType } from "@/app/utils/workouts";
import Form from 'next/form';
import { useState, useEffect, ReactNode, JSX, Fragment } from "react";
import { useActionState } from "react";

// Sport selector component
const SportSelector = (): ReactNode => (
  <div className="w-full max-w-xs">
    <label className="form-control w-full">
      <div className="label sr-only">
        <span className="label-text">Sport</span>
      </div>
      <select name="activityType" className="select select-bordered w-full" required>
        <option disabled selected>Sport</option>
        {activities().map(([value, activity]) => (
          <option key={value} value={value}>{activity}</option>
        ))}
      </select>
    </label>
  </div>
);

// Workout type selector component
const WorkoutTypeSelector = (): ReactNode => (
  <div className="w-full max-w-xs">
    <label className="form-control w-full">
      <div className="label sr-only">
        <span className="label-text">Workout type</span>
      </div>
      <select name="goalSelectMenu" className="select select-bordered w-full" required>
        <option disabled selected>Workout type</option>
        <option value="open">Open goal</option>
        <option value="distance">Distance</option>
        <option value="calories">Calories</option>
        <option value="time">Time</option>
        <option value="pacer">Pacer</option>
        <option value="custom">Custom</option>
      </select>
    </label>
  </div>
);

// Workout name input component
const WorkoutNameInput = (): ReactNode => (
  <div className="w-full max-w-xs">
    <label className="form-control w-full">
      <div className="label sr-only">
        <span className="label-text">Name</span>
      </div>
      <input name="displayName" type="text" placeholder="Workout name" className="input input-bordered w-full" required />
    </label>
  </div>
);

// Submit button component
const SubmitButton = ({ disabled = true }: { disabled?: boolean }): ReactNode => (
  <div className="w-full max-w-xs">
    <button type="submit" className={`btn btn-primary w-full ${disabled ? 'btn-disabled' : ''}`} disabled={disabled}>
      Create workout
    </button>
  </div>
);

// Workout goal input components
const DistanceGoalInput = (): ReactNode => (
  <div className="form-control w-full max-w-xs">
    <div className="flex items-center gap-2 mb-2">
      <input
        name="targetValue"
        type="number"
        min={0}
        pattern="\d*"
        placeholder="Distance"
        className="input input-bordered w-full max-w-xs"
        required
      />
    </div>
    <div className="flex flex-wrap gap-2">
      <label className="label cursor-pointer gap-1">
        <input
          type="radio"
          name="unit"
          className="radio radio-sm"
          required
          defaultValue={DistanceUnits.miles}
          defaultChecked
        />
        <span className="label-text">{DistanceUnits.miles}</span>
      </label>
      <label className="label cursor-pointer gap-1">
        <input type="radio" name="unit" value={DistanceUnits.kilometers} className="radio radio-sm" />
        <span className="label-text">{DistanceUnits.kilometers}</span>
      </label>
      <label className="label cursor-pointer gap-1">
        <input type="radio" name="unit" value={DistanceUnits.yards} className="radio radio-sm" />
        <span className="label-text">{DistanceUnits.yards}</span>
      </label>
      <label className="label cursor-pointer gap-1">
        <input type="radio" name="unit" value={DistanceUnits.meters} className="radio radio-sm" />
        <span className="label-text">{DistanceUnits.meters}</span>
      </label>
    </div>
  </div>
);


const EnergyGoalInput = (): ReactNode => (
  <div className="form-control w-full max-w-xs">
    <div className="flex items-center gap-2 mb-2">
      <input
        name="targetValue"
        type="number"
        min={0}
        pattern="\d*"
        placeholder="Energy"
        className="input input-bordered w-full max-w-xs"
        required
      />
    </div>
    <div className="flex flex-wrap gap-2">
      <label className="label cursor-pointer gap-1">
        <input
          type="radio"
          name="unit"
          defaultValue={EnergyUnits.calories}
          defaultChecked
          className="radio radio-sm"
          required
        />
        <span className="label-text">{EnergyUnits.calories}</span>
      </label>
      <label className="label cursor-pointer gap-1">
        <input type="radio" name="unit" value={EnergyUnits.kilocalories} className="radio radio-sm" />
        <span className="label-text">{EnergyUnits.kilocalories}</span>
      </label>
    </div>
  </div>
);


const TimeGoalInput = (): ReactNode => (
  <div className="form-control w-full max-w-xs">
    <div className="flex items-center gap-2">
      <div className="flex flex-wrap gap-2">
        <input
          placeholder={TimeUnits.hours}
          name={TimeUnits.hours}
          type="number"
          min={0}
          max={23}
          pattern="\d*"
          className="input input-bordered w-20"
          data-time-input
        />
        <input
          placeholder={TimeUnits.minutes}
          name={TimeUnits.minutes}
          type="number"
          min={0}
          max={59}
          pattern="\d*"
          className="input input-bordered w-20"
          data-time-input
        />
        <input
          placeholder={TimeUnits.seconds}
          name={TimeUnits.seconds}
          type="number"
          min={0}
          max={59}
          pattern="\d*"
          className="input input-bordered w-20"
          data-time-input
        />
      </div>
    </div>
    <div className="mt-1 text-xs text-gray-500">
      At least one time field is required
    </div>
  </div>
);

// IntervalStep component for custom workouts
const IntervalStep = ({ stepIndex, onAddStep }: { stepIndex: number, onAddStep: () => void }): ReactNode => {
  const [purpose, setPurpose] = useState<'work' | 'recovery'>('work');
  const [goalType, setGoalType] = useState<string>('');

  return (
    <div className="border border-gray-300 rounded-lg p-4 mb-4">
      <h4 className="font-semibold mb-3">Step {stepIndex + 1}</h4>

      {/* Purpose selector */}
      <div className="form-control w-full max-w-xs mb-4">
        <label className="label">
          <span className="label-text">Purpose</span>
        </label>
        <div className="flex flex-wrap gap-4">
          <label className="label cursor-pointer gap-2">
            <input
              type="radio"
              name={`step-${stepIndex}-purpose`}
              value="work"
              checked={purpose === 'work'}
              onChange={(e) => setPurpose(e.target.value as 'work' | 'recovery')}
              className="radio radio-sm"
            />
            <span className="label-text">Work</span>
          </label>
          <label className="label cursor-pointer gap-2">
            <input
              type="radio"
              name={`step-${stepIndex}-purpose`}
              value="recovery"
              checked={purpose === 'recovery'}
              onChange={(e) => setPurpose(e.target.value as 'work' | 'recovery')}
              className="radio radio-sm"
            />
            <span className="label-text">Recovery</span>
          </label>
        </div>
      </div>

      {/* Goal selector - only show for work steps */}
      {purpose === 'work' && (
        <>
          <div className="form-control w-full max-w-xs mb-4">
            <label className="label">
              <span className="label-text">Goal</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={goalType}
              onChange={(e) => setGoalType(e.target.value)}
              name={`step-${stepIndex}-goal-type`}
            >
              <option value="">Select goal</option>
              <option value="distance">Distance</option>
              <option value="calories">Calories</option>
              <option value="time">Time</option>
            </select>
          </div>

          {/* Render goal input based on selected goal type */}
          {goalType === 'distance' && (
            <div className="mb-4">
              <DistanceGoalInput />
            </div>
          )}
          {goalType === 'calories' && (
            <div className="mb-4">
              <EnergyGoalInput />
            </div>
          )}
          {goalType === 'time' && (
            <div className="mb-4">
              <TimeGoalInput />
            </div>
          )}
        </>
      )}

      {/* Recovery time input - only show for recovery steps */}
      {purpose === 'recovery' && (
        <div className="mb-4">
          <label className="label">
            <span className="label-text">Recovery Duration</span>
          </label>
          <TimeGoalInput />
        </div>
      )}

      {/* Add next step button */}
      <button
        type="button"
        className="btn btn-outline btn-sm"
        onClick={onAddStep}
      >
        Add next Step
      </button>
    </div>
  );
};

const CustomGoalInput = (): ReactNode => {
  const [steps, setSteps] = useState<number[]>([0]);

  const addStep = () => {
    setSteps(prev => [...prev, prev.length]);
  };

  return (
    <div className="form-control w-full max-w-xs">
      <div className="py-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-4">Custom Workout Builder</h3>

        {steps.map((stepIndex) => (
          <IntervalStep
            key={stepIndex}
            stepIndex={stepIndex}
            onAddStep={addStep}
          />
        ))}
      </div>
    </div>
  );
};

function handleFormAction(state: Record<string, unknown>, event: { target: { name: string; value: string } }): Record<string, unknown> {
  const { name, value } = event.target;

  if (name === "activity") {
    if (value === 'swimBikeRun') {
      state = { ...state, workoutType: 'swimBikeRunWorkout' };
      delete state.goalSelectMenu;
    } else {
      delete state.workoutType;
    }
  }

  return { ...state, [name]: value };
}

interface WorkoutActionResult {
  displayName: WorkoutPlan["displayName"]
  success?: boolean
  blob?: Blob
  data?: string
}

export default function WorkoutForm(): JSX.Element {
  const [formState, handleFormChange] = useActionState(handleFormAction, {});
  const [actionResult, setActionResult] = useState<WorkoutActionResult | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);

  // Handle blob download when action returns a blob
  useEffect(() => {
    if (actionResult?.success && actionResult?.blob) {
      const url = window.URL.createObjectURL(actionResult.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${actionResult?.displayName}.workout`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  }, [actionResult]);

  // Validate time inputs - at least one must have a value
  useEffect(() => {
    if (formState?.goalSelectMenu === 'time') {
      const timeInputs = document.querySelectorAll('[data-time-input]');
      let hasTimeValue = false;

      timeInputs.forEach((input) => {
        if ((input as HTMLInputElement).value) {
          hasTimeValue = true;
        }
      });

      // Add validation attribute to inputs based on whether any have values
      timeInputs.forEach((input) => {
        if (hasTimeValue) {
          input.removeAttribute('required');
        } else {
          input.setAttribute('required', 'required');
        }
      });
    }
  }, [formState?.goalSelectMenu, formState?.[TimeUnits.hours], formState?.[TimeUnits.minutes], formState?.[TimeUnits.seconds]]);

  // Check if the form is valid
  const validateForm = () => {
    const form = document.querySelector('form');
    setIsFormValid(form ? form.checkValidity() : false);
  };

  return (
    <Form
      className="w-full max-w-md mx-auto"
      action={async (formData) => {
        const result = await createWorkout(formData);
        setActionResult(result);
        return result;
      }}
      onChange={(e) => {
        // This is needed for TypeScript to recognize the correct type
        if ('target' in e && e.target && 'name' in e.target && 'value' in e.target) {
          // We need to cast to the expected type that handleFormAction accepts
          handleFormChange(e as unknown as { target: { name: string; value: string } });

          // Validate form after any change
          setTimeout(validateForm, 0);
        }
      }}
      onInvalid={() => {
        setIsFormValid(false);
      }}
    >
      <div className="flex flex-col items-center space-y-6">
        {/* Sport selection is always shown */}
        {SportSelector()}

        {/* Only show workout type selector if a sport is selected */}
        {formState?.activityType && formState.activityType !== 'swimBikeRun' ?
          WorkoutTypeSelector() : null
        }

        {/* Only show goal inputs if workout type is selected */}
        {formState?.activityType &&
          formState?.goalSelectMenu &&
          formState?.workoutType !== workoutType.swimBikeRunWorkout ? (
          <>
            {/* Show specific goal input based on goalSelectMenu value */}
            {formState.goalSelectMenu === 'distance' && <DistanceGoalInput />}
            {formState.goalSelectMenu === 'calories' && <EnergyGoalInput />}
            {formState.goalSelectMenu === 'time' && <TimeGoalInput />}
            {formState.goalSelectMenu === 'custom' && <CustomGoalInput />}

            {WorkoutNameInput()}
          </>
        ) : null}

        {SubmitButton({ disabled: !isFormValid })}
      </div>
    </Form>
  )
}
