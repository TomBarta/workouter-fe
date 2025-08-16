import { createWorkout } from "@/app/lib/actions";
import { useState, useEffect, useCallback, JSX } from "react";
import {
  SportSelector,
  WorkoutTypeSelector,
  WorkoutNameInput,
  CustomWorkoutBuilder,
  SubmitButton,
  WorkoutFormData,
  createDefaultBlock,
  Block
} from "./components";

// ============================================================================
// MAIN FORM COMPONENT
// ============================================================================

export default function WorkoutForm(): JSX.Element {
  const [actionResult, setActionResult] = useState<{ success?: boolean; displayName?: string } | null>(null);
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

  // Update form data
  const updateFormData = (updates: Partial<WorkoutFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Update blocks
  const updateBlocks = (blocks: Block[]) => {
    updateFormData({ blocks });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert form data to the format expected by the backend
    const formDataToSubmit = new FormData();

    // Basic workout info
    formDataToSubmit.append('activityType', formData.activityType);
    formDataToSubmit.append('location', formData.location);
    formDataToSubmit.append('displayName', formData.displayName);
    formDataToSubmit.append('swimmingLocation', formData.swimmingLocation);
    formDataToSubmit.append('workoutType', formData.workoutType);
    formDataToSubmit.append('goalSelectMenu', formData.goalSelectMenu || '');

    // Add block and step data
    formData.blocks.forEach((block, blockIndex) => {
      formDataToSubmit.append(`block-${blockIndex}-type`, block.type);
      formDataToSubmit.append(`block-${blockIndex}-iterations`, block.iterations.toString());

      block.steps.forEach((step, stepIndex) => {
        formDataToSubmit.append(`block-${blockIndex}-step-${stepIndex}-purpose`, step.purpose);

        if (step.goalType && step.goalType !== 'open') {
          formDataToSubmit.append(`block-${blockIndex}-step-${stepIndex}-goal-type`, step.goalType);

          if (step.goalType === 'distance') {
            if (step.distanceValue) formDataToSubmit.append(`block-${blockIndex}-step-${stepIndex}-distance-value`, step.distanceValue.toString());
            if (step.distanceUnit) formDataToSubmit.append(`block-${blockIndex}-step-${stepIndex}-distance-unit`, step.distanceUnit);
          } else if (step.goalType === 'calories') {
            if (step.caloriesValue) formDataToSubmit.append(`block-${blockIndex}-step-${stepIndex}-calories-value`, step.caloriesValue.toString());
            if (step.caloriesUnit) formDataToSubmit.append(`block-${blockIndex}-step-${stepIndex}-calories-unit`, step.caloriesUnit);
          } else if (step.goalType === 'time') {
            if (step.timeHours) formDataToSubmit.append(`block-${blockIndex}-step-${stepIndex}-hrs`, step.timeHours.toString());
            if (step.timeMinutes) formDataToSubmit.append(`block-${blockIndex}-step-${stepIndex}-min`, step.timeMinutes.toString());
            if (step.timeSeconds) formDataToSubmit.append(`block-${blockIndex}-step-${stepIndex}-sec`, step.timeSeconds.toString());
          }
        }
      });
    });

    // Submit to backend
    try {
      const result = await createWorkout(formDataToSubmit);
      setActionResult(result);
    } catch (error) {
      console.error('Error creating workout:', error);
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
    <div className="min-h-screen bg-brand-gradient py-8">
      <div className="container mx-auto px-4">
        <form onSubmit={handleSubmit} className="max-w-1/3 mx-auto">
          <div className="space-y-8">
            {/* Basic workout info */}
            <div className="card-workout">
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SportSelector
                    value={formData.activityType}
                    onChange={(value) => updateFormData({ activityType: value })}
                  />

                  {/* Only show workout type selector if a sport is selected */}
                  {formData.activityType && (
                    <WorkoutTypeSelector
                      value={formData.goalSelectMenu || ''}
                      onChange={(value) => updateFormData({ goalSelectMenu: value })}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Custom workout builder - only show if custom workout type is selected */}
            {formData.goalSelectMenu === 'custom' && (
              <div className="card-workout">
                <div className="card-body">
                  <CustomWorkoutBuilder
                    blocks={formData.blocks}
                    onUpdate={updateBlocks}
                  />
                </div>
              </div>
            )}

            {/* Workout details - show at the end if workout type is selected */}
            {formData.goalSelectMenu && (
              <div className="card-workout">
                <div className="card-body">
                  <h2 className="card-title text-2xl text-workouter-orange-600 mb-6 font-bold">Workout Details</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <WorkoutNameInput
                      value={formData.displayName}
                      onChange={(value) => updateFormData({ displayName: value })}
                    />

                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text text-lg font-semibold text-workouter-black-700">Location</span>
                      </label>
                      <select
                        value={formData.location}
                        onChange={(e) => updateFormData({ location: e.target.value as 'indoor' | 'outdoor' })}
                        className="select select-bordered w-full text-lg border-workouter-gray-300 focus:border-workouter-orange-500 focus:ring-2 focus:ring-workouter-orange-500/20 focus:outline-none transition-colors duration-200"
                      >
                        <option value="indoor">Indoor</option>
                        <option value="outdoor">Outdoor</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit button - only show if all required fields are filled */}
            {formData.activityType && formData.goalSelectMenu && formData.displayName && (
              <div className="text-center">
                <SubmitButton disabled={!isFormValid} />
              </div>
            )}
          </div>
        </form>

        {/* Action result display */}
        {actionResult && (
          <div className="mt-8 text-center">
            <div className="alert alert-success">
              <span>Workout created successfully!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

