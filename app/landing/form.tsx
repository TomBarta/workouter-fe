// Removed server action import - using API route instead
import { useState, useEffect, useCallback, JSX, Fragment } from "react";
import {
  SportSelector,
  WorkoutTypeSelector,
  WorkoutNameInput,
  WorkoutDistance,
  WorkoutCalorie,
  WorkoutTime,
  CustomWorkoutBuilder,
  SubmitButton,
  WorkoutFormData,
  createDefaultBlock,
  Block
} from "./components";
import { createWorkoutPayload, type WorkoutGoals } from '@/app/lib/pageActionUtils';
import { DistanceUnits, EnergyUnits } from "@/app/utils/workouts";

// ============================================================================
// MAIN FORM COMPONENT
// ============================================================================

export default function WorkoutForm(): JSX.Element {
  const [actionResult, setActionResult] = useState<{ success?: boolean; displayName?: string; error?: string } | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);

  // Form data state
  const [formData, setFormData] = useState<WorkoutFormData>({
    activityType: '',
    location: 'indoor',
    displayName: '',
    swimmingLocation: 'indoors',
    workoutType: '',
    goalSelectMenu: '',
    blocks: [createDefaultBlock()]
  });

  // Distance goal state
  const [distanceGoal, setDistanceGoal] = useState<{ distanceValue?: number; distanceUnit?: DistanceUnits }>({
    distanceUnit: DistanceUnits.meters
  });

  // Calorie goal state
  const [calorieGoal, setCalorieGoal] = useState<{ calorieValue?: number; calorieUnit?: EnergyUnits }>({
    calorieUnit: EnergyUnits.calories
  });

  // Time goal state
  const [timeGoal, setTimeGoal] = useState<{ timeHours?: number; timeMinutes?: number; timeSeconds?: number }>({});

  // Update form data
  const updateFormData = (updates: Partial<WorkoutFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Update blocks
  const updateBlocks = (blocks: Block[]) => {
    updateFormData({ blocks });
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      activityType: '',
      location: 'indoor',
      displayName: '',
      swimmingLocation: 'indoors',
      workoutType: '',
      goalSelectMenu: '',
      blocks: [createDefaultBlock()]
    });
    setDistanceGoal({
      distanceUnit: DistanceUnits.meters
    });
    setCalorieGoal({
      calorieUnit: EnergyUnits.calories
    });
    setTimeGoal({});
    setActionResult(null);
    setIsFormValid(false);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create workout payload using the discrete function
    const goals: WorkoutGoals = {
      distance: distanceGoal,
      calories: calorieGoal,
      time: timeGoal
    };

    const payload = createWorkoutPayload(formData, goals, true);

    // Submit to API route
    try {
      const response = await fetch('/api/v1/apple-watch/workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const contentType = response.headers.get('Content-Type');

        if (contentType && contentType.includes('application/octet-stream')) {
          // Handle binary file download
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${formData.displayName}.workout`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          setActionResult({ success: true, displayName: formData.displayName });
        } else {
          // Handle JSON response
          const result = await response.json();
          setActionResult(result);
        }
      } else {
        const error = await response.json();
        setActionResult({ success: false, ...error });
      }
    } catch (error) {
      console.error('Error creating workout:', error);
      setActionResult({ success: false, error: 'Failed to create workout' });
    }
  };

  // Validate form
  const validateForm = useCallback(() => {
    const isValid = Boolean(formData.activityType && formData.displayName &&
      (formData.goalSelectMenu !== 'custom' || formData.blocks.length > 0));
    setIsFormValid(isValid);
  }, [formData]);

  useEffect(() => {
    validateForm();
  }, [formData, validateForm]);

  return (
    <div className="min-h-screen bg-brand-gradient rounded-lg py-6">
      <div className="container mx-auto px-4">
        <form onSubmit={handleSubmit} className="max-w-1/3 mx-auto">
          <div className="space-y-8">
            {/* Basic workout info */}
            <div className="card-workout">
              <div className="card-body p-0 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SportSelector
                    value={formData.activityType}
                    onChange={(value) => updateFormData({ activityType: value })}
                  />

                  {/* Only show workout type selector if a sport is selected */}
                  <WorkoutTypeSelector
                    value={formData.goalSelectMenu || ''}
                    onChange={(value) => updateFormData({ goalSelectMenu: value })}
                    disabled={!formData.activityType}
                  />
                  {formData.goalSelectMenu === 'distance' && (
                    <WorkoutDistance
                      distanceValue={distanceGoal.distanceValue}
                      distanceUnit={distanceGoal.distanceUnit}
                      onChange={setDistanceGoal}
                    />
                  )}
                  {formData.goalSelectMenu === 'calories' && (
                    <WorkoutCalorie
                      calorieValue={calorieGoal.calorieValue}
                      calorieUnit={calorieGoal.calorieUnit}
                      onChange={setCalorieGoal}
                    />
                  )}
                  {formData.goalSelectMenu === 'time' && (
                    <WorkoutTime
                      timeHours={timeGoal.timeHours}
                      timeMinutes={timeGoal.timeMinutes}
                      timeSeconds={timeGoal.timeSeconds}
                      onChange={setTimeGoal}
                    />
                  )}
                  {/* Workout details - show at the end if workout type is selected but not custom */}
                  {formData.goalSelectMenu && formData.goalSelectMenu !== 'custom' && (
                    <Fragment>
                      <WorkoutNameInput
                        value={formData.displayName}
                        onChange={(value) => updateFormData({ displayName: value })}
                      />

                      <div className="form-control w-full">
                        <div className="flex gap-4">
                          <label className="label cursor-pointer">
                            <input
                              type="radio"
                              name="location"
                              value="indoor"
                              checked={formData.location === 'indoor'}
                              onChange={(e) => updateFormData({ location: e.target.value as 'indoor' | 'outdoor' })}
                              className="radio border-wktr-black-950"
                            />
                            <span className="label-text ml-2">Indoor</span>
                          </label>
                          <label className="label cursor-pointer">
                            <input
                              type="radio"
                              name="location"
                              value="outdoor"
                              checked={formData.location === 'outdoor'}
                              onChange={(e) => updateFormData({ location: e.target.value as 'indoor' | 'outdoor' })}
                              className="radio border-wktr-black-950"
                            />
                            <span className="label-text ml-2">Outdoor</span>
                          </label>
                        </div>
                      </div>
                    </Fragment>
                  )}
                </div>
              </div>
            </div>

            {/* Custom workout builder - only show if custom workout type is selected */}
            {formData.goalSelectMenu === 'custom' && (
              <div className="card-workout">
                <CustomWorkoutBuilder
                  blocks={formData.blocks}
                  onUpdate={updateBlocks}
                />
              </div>
            )}

            {/* Submit button - only show if all required fields are filled */}
            {formData.activityType && formData.goalSelectMenu && (
              <div className="grid grid-cols-1 gap-4 justify-items-center md:justify-items-end">
                <SubmitButton variant="dark" disabled={!isFormValid} />
                {actionResult?.success && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn btn-lg w-full max-w-md bg-wktr-gray-300 text-wktr-black-700 hover:bg-wktr-gray-400 hover:text-wktr-black-800 transition-all duration-200"
                  >
                    Reset
                  </button>
                )}
              </div>
            )}
          </div>
          {/* Action result display */}
        </form>
      </div>
    </div>
  );
}

