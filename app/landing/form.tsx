// Removed server action import - using API route instead
import { useState, useEffect, useCallback, JSX } from "react";
import {
  SportSelector,
  WorkoutTypeSelector,
  WorkoutNameInput,
  WorkoutDistance,
  CustomWorkoutBuilder,
  SubmitButton,
  WorkoutFormData,
  createDefaultBlock,
  Block
} from "./components";
import { DistanceUnits } from "@/app/utils/workouts";

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
    setActionResult(null);
    setIsFormValid(false);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert form data to JSON payload
    const payload: Record<string, string> = {
      activityType: formData.activityType,
      location: formData.location,
      displayName: formData.displayName,
      swimmingLocation: formData.swimmingLocation,
      workoutType: formData.workoutType,
      goalSelectMenu: formData.goalSelectMenu || '',
      targetValue: distanceGoal.distanceValue?.toString() || '',
      unit: distanceGoal.distanceUnit || DistanceUnits.meters,
    };

    // Add block and step data as flattened properties for compatibility with existing backend processing
    formData.blocks.forEach((block, blockIndex) => {
      payload[`block-${blockIndex}-type`] = block.type;
      payload[`block-${blockIndex}-iterations`] = block.iterations.toString();

      block.steps.forEach((step, stepIndex) => {
        payload[`block-${blockIndex}-step-${stepIndex}-purpose`] = step.purpose;

        if (step.goalType && step.goalType !== 'open') {
          payload[`block-${blockIndex}-step-${stepIndex}-goal-type`] = step.goalType;

          if (step.goalType === 'distance') {
            if (step.distanceValue) payload[`block-${blockIndex}-step-${stepIndex}-distance-value`] = step.distanceValue.toString();
            if (step.distanceUnit) payload[`block-${blockIndex}-step-${stepIndex}-distance-unit`] = step.distanceUnit;
          } else if (step.goalType === 'calories') {
            if (step.caloriesValue) payload[`block-${blockIndex}-step-${stepIndex}-calories-value`] = step.caloriesValue.toString();
            if (step.caloriesUnit) payload[`block-${blockIndex}-step-${stepIndex}-calories-unit`] = step.caloriesUnit;
          } else if (step.goalType === 'time') {
            if (step.timeHours) payload[`block-${blockIndex}-step-${stepIndex}-hrs`] = step.timeHours.toString();
            if (step.timeMinutes) payload[`block-${blockIndex}-step-${stepIndex}-min`] = step.timeMinutes.toString();
            if (step.timeSeconds) payload[`block-${blockIndex}-step-${stepIndex}-sec`] = step.timeSeconds.toString();
          }
        }
      });
    });

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
                  {/* Workout details - show at the end if workout type is selected */}
                  {formData.goalSelectMenu && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Custom workout builder - only show if custom workout type is selected */}
            {formData.goalSelectMenu === 'custom' && (
              <div className="card-workout">
                <div className="card-body p-0 md:p-6">
                  <CustomWorkoutBuilder
                    blocks={formData.blocks}
                    onUpdate={updateBlocks}
                  />
                </div>
              </div>
            )}

            {/* Submit button - only show if all required fields are filled */}
            {formData.activityType && formData.goalSelectMenu && (
              <div className="text-center">
                <SubmitButton variant="dark" disabled={!isFormValid} />
              </div>
            )}
          </div>
        </form>

        {/* Action result display */}
        {actionResult && (
          <div className="mt-8 text-center space-y-4">
            {actionResult.success ? (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-lg w-full max-w-md bg-wktr-gray-300 text-wktr-black-700 hover:bg-wktr-gray-400 hover:text-wktr-black-800 transition-all duration-200"
                >
                  Reset
                </button>
              </div>
            ) : (
              <div className="alert alert-error">
                <span>Error: {actionResult.error || 'Failed to create workout'}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

