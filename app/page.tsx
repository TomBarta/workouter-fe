'use client'

import { useActionState } from "react";
import { activities, DistanceUnits, EnergyUnits, TimeUnits, workoutGoals, WorkoutGoalTypes, workoutType } from "@/app/utils/workouts";
import Form from 'next/form';
import { createWorkout } from "@/app/lib/actions";
import { useEffect, useState } from "react";

function handleFormAction(state: Record<string, unknown>, event: { target: { name: string; value: string } }) {
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

// Workout goal input components
const DistanceGoalInput = () => (
  <div className="form-control w-full max-w-xs">
    <div className="flex items-center gap-2 mb-2">
      <input
        name="distance"
        type="number"
        min={0}
        pattern="\d*"
        placeholder="Distance"
        className="input input-bordered w-full max-w-xs"
      />
    </div>
    <div className="flex flex-wrap gap-2">
      <label className="label cursor-pointer gap-1">
        <input type="radio" name="unit" value={DistanceUnits.miles} className="radio radio-sm" />
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

const EnergyGoalInput = () => (
  <div className="form-control w-full max-w-xs">
    <div className="flex items-center gap-2 mb-2">
      <input
        name="energy"
        type="number"
        min={0}
        pattern="\d*"
        placeholder="Energy"
        className="input input-bordered w-full max-w-xs"
      />
    </div>
    <div className="flex flex-wrap gap-2">
      <label className="label cursor-pointer gap-1">
        <input type="radio" name="unit" value={EnergyUnits.calories} className="radio radio-sm" />
        <span className="label-text">{EnergyUnits.calories}</span>
      </label>
      <label className="label cursor-pointer gap-1">
        <input type="radio" name="unit" value={EnergyUnits.kilocalories} className="radio radio-sm" />
        <span className="label-text">{EnergyUnits.kilocalories}</span>
      </label>
    </div>
  </div>
);

const TimeGoalInput = () => (
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
        />
        <input
          placeholder={TimeUnits.minutes}
          name={TimeUnits.minutes}
          type="number"
          min={0}
          max={59}
          pattern="\d*"
          className="input input-bordered w-20"
        />
        <input
          placeholder={TimeUnits.seconds}
          name={TimeUnits.seconds}
          type="number"
          min={0}
          max={59}
          pattern="\d*"
          className="input input-bordered w-20"
        />
      </div>
    </div>
  </div>
);

function WorkoutGoalInput({ type }: { type: WorkoutGoalTypes }) {
  switch (type) {
    case WorkoutGoalTypes.distance.toLowerCase():
      return <DistanceGoalInput />;
    case WorkoutGoalTypes.energy.toLowerCase():
      return <EnergyGoalInput />;
    case WorkoutGoalTypes.time.toLowerCase():
      return <TimeGoalInput />;
    default:
      return null;
  }
}

interface WorkoutActionResult {
  success?: boolean
  blob?: Blob
  data?: string
}

export default function Index() {
  const [formState, handleFormChange] = useActionState(handleFormAction, {});
  const [actionResult, setActionResult] = useState<WorkoutActionResult | null>(null);

  // Handle blob download when action returns a blob
  useEffect(() => {
    if (actionResult?.success && actionResult?.blob) {
      const url = window.URL.createObjectURL(actionResult.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'workout-1.workout';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  }, [actionResult]);

  return (
    <main>
      <section className="hero bg-base-200 min-h-screen">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Welcome to Workouter</h1>
            <p className="py-6">
              Build workouts for Apple Watch.
              For free.
            </p>
            <div>
              <Form
                action={async (formData) => {
                  const result = await createWorkout(formData);
                  setActionResult(result);
                  return result;
                }}
                onChange={handleFormChange}
              >
                <div>
                  <label className="form-control w-full max-w-xs">
                    <div className="label sr-only">
                      <span className="label-text">Sport</span>
                    </div>
                    <select name="activityType" className="select select-bordered">
                      <option disabled selected>Sport</option>
                      {activities().map(([value, activity]) => (
                        <option key={value} value={value}>{activity}</option>
                      ))}
                    </select>
                  </label>
                </div>

                {formState?.activityType !== 'swimBikeRun' && (
                  <div className="pt-2">
                    <label className="form-control w-full max-w-xs">
                      <div className="label sr-only">
                        <span className="label-text">Workout type</span>
                      </div>
                      <select name="goalSelectMenu" className="select select-bordered">
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
                )}

                {formState?.workoutType !== workoutType.swimBikeRunWorkout && (
                  <>
                    <div className="pt-2">
                      <label className="form-control w-full max-w-xs">
                        <div className="label sr-only">
                          <span className="label-text">Goal</span>
                        </div>
                        <select name="goal" className="select select-bordered">
                          <option disabled selected>Goal</option>
                          {workoutGoals().map(([value, activity]) => (
                            <option key={value} value={value}>{activity}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="pt-2">
                      <WorkoutGoalInput type={formState?.goal as WorkoutGoalTypes} />
                    </div>
                    <div className="pt-2">
                      <label className="form-control w-full max-w-xs">
                        <div className="label sr-only">
                          <span className="label-text">Name</span>
                        </div>
                        <input name="displayName" type="text" placeholder="Name" className="input input-bordered w-full max-w-xs" />
                      </label>
                    </div>
                    <div className="pt-2">
                      <label className="form-control w-full max-w-xs">
                        <div className="label sr-only">
                          <span className="label-text">Author</span>
                        </div>
                        <input name="author" type="text" placeholder="Author" className="input input-bordered w-full max-w-xs" />
                      </label>
                    </div>
                  </>
                )}

                <button className="btn btn-primary mt-4">Create workout</button>
              </Form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
