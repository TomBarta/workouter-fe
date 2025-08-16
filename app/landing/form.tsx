import { createWorkout } from "@/app/lib/actions";
import { activities, DistanceUnits, EnergyUnits } from "@/app/utils/workouts";
import { useState, useEffect, JSX } from "react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Step {
  id: string;
  purpose: 'work' | 'recovery';
  goalType?: 'distance' | 'calories' | 'time' | 'open';
  distanceValue?: number;
  distanceUnit?: string;
  caloriesValue?: number;
  caloriesUnit?: string;
  timeHours?: number;
  timeMinutes?: number;
  timeSeconds?: number;
}

interface Block {
  id: string;
  type: 'work' | 'recovery';
  iterations: number;
  steps: Step[];
}

interface WorkoutFormData {
  activityType: string;
  location: 'indoor' | 'outdoor';
  displayName: string;
  swimmingLocation: 'indoors';
  workoutType: string;
  goalSelectMenu?: string;
  blocks: Block[];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const generateId = () => Math.random().toString(36).substring(2, 11);

const createDefaultStep = (): Step => ({
  id: generateId(),
  purpose: 'work',
  goalType: 'open'
});

const createDefaultBlock = (): Block => ({
  id: generateId(),
  type: 'work',
  iterations: 1,
  steps: [createDefaultStep()]
});

// ============================================================================
// COMPONENTS
// ============================================================================

// Sport selector component
const SportSelector = ({ value, onChange }: { value: string; onChange: (value: string) => void }): JSX.Element => (
  <div className="w-full max-w-md">
    <label className="form-control w-full">
      <div className="label">
        <span className="label-text text-lg font-semibold">Choose Your Sport</span>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="select select-bordered w-full text-lg"
        required
      >
        <option value="">Select a sport...</option>
        {activities().map(([value, activity]) => (
          <option key={value} value={value}>{activity}</option>
        ))}
      </select>
    </label>
  </div>
);

// Workout type selector component
const WorkoutTypeSelector = ({ value, onChange }: { value: string; onChange: (value: string) => void }): JSX.Element => (
  <div className="w-full max-w-md">
    <label className="form-control w-full">
      <div className="label">
        <span className="label-text text-lg font-semibold">Workout Type</span>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="select select-bordered w-full text-lg"
        required
      >
        <option value="">Choose workout type...</option>
        <option value="open">Open Goal</option>
        <option value="distance">Distance</option>
        <option value="calories">Calories</option>
        <option value="time">Time</option>
        <option value="custom">Custom Interval</option>
      </select>
    </label>
  </div>
);

// Workout name input component
const WorkoutNameInput = ({ value, onChange }: { value: string; onChange: (value: string) => void }): JSX.Element => (
  <div className="w-full max-w-md">
    <label className="form-control w-full">
      <div className="label">
        <span className="label-text text-lg font-semibold">Workout Name</span>
      </div>
      <input
        name="displayName"
        type="text"
        placeholder="Enter workout name..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input input-bordered w-full text-lg"
        required
      />
    </label>
  </div>
);

// Step component for custom workouts
const StepCard = ({
  step,
  onUpdate,
  onRemove,
  canRemove
}: {
  step: Step;
  onUpdate: (step: Step) => void;
  onRemove: () => void;
  canRemove: boolean;
}): JSX.Element => {
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

// Block component for custom workouts
const BlockCard = ({
  block,
  onUpdate,
  onRemove,
  canRemove
}: {
  block: Block;
  onUpdate: (block: Block) => void;
  onRemove: () => void;
  canRemove: boolean;
}): JSX.Element => {
  const updateBlock = (updates: Partial<Block>) => {
    onUpdate({ ...block, ...updates });
  };

  const addStepToBlock = () => {
    const newStep = createDefaultStep();
    updateBlock({ steps: [...block.steps, newStep] });
  };

  const updateStep = (stepId: string, updates: Partial<Step>) => {
    const updatedSteps = block.steps.map(step =>
      step.id === stepId ? { ...step, ...updates } : step
    );
    updateBlock({ steps: updatedSteps });
  };

  const removeStep = (stepId: string) => {
    if (block.steps.length > 1) {
      const updatedSteps = block.steps.filter(step => step.id !== stepId);
      updateBlock({ steps: updatedSteps });
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl border-2 border-primary/20">
      <div className="card-body">
        <div className="flex justify-between items-start mb-4">
          <h3 className="card-title text-xl text-primary">
            Block {block.type === 'work' ? 'Work' : 'Recovery'}
          </h3>
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

        {/* Block type selector */}
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text font-medium">Block Type</span>
          </label>
          <div className="flex gap-4">
            <label className="label cursor-pointer gap-2">
              <input
                type="radio"
                checked={block.type === 'work'}
                onChange={() => updateBlock({ type: 'work' })}
                className="radio radio-primary"
              />
              <span className="label-text">Work</span>
            </label>
            <label className="label cursor-pointer gap-2">
              <input
                type="radio"
                checked={block.type === 'recovery'}
                onChange={() => updateBlock({ type: 'recovery' })}
                className="radio radio-primary"
              />
              <span className="label-text">Recovery</span>
            </label>
          </div>
        </div>

        {/* Iterations input */}
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text font-medium">Iterations</span>
          </label>
          <input
            type="number"
            min={1}
            value={block.iterations}
            onChange={(e) => updateBlock({ iterations: parseInt(e.target.value) || 1 })}
            className="input input-bordered w-24"
          />
        </div>

        {/* Steps */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-lg">Steps</h4>
            <button
              type="button"
              onClick={addStepToBlock}
              className="btn btn-primary btn-sm"
            >
              Add Step
            </button>
          </div>

          {block.steps.map((step) => (
            <div key={step.id} className="ml-4">
              <StepCard
                step={step}
                onUpdate={(updatedStep) => updateStep(step.id, updatedStep)}
                onRemove={() => removeStep(step.id)}
                canRemove={block.steps.length > 1}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Custom workout builder component
const CustomWorkoutBuilder = ({
  blocks,
  onUpdate
}: {
  blocks: Block[];
  onUpdate: (blocks: Block[]) => void;
}): JSX.Element => {
  const addBlock = () => {
    onUpdate([...blocks, createDefaultBlock()]);
  };

  const updateBlock = (blockId: string, updates: Partial<Block>) => {
    const updatedBlocks = blocks.map(block =>
      block.id === blockId ? { ...block, ...updates } : block
    );
    onUpdate(updatedBlocks);
  };

  const removeBlock = (blockId: string) => {
    if (blocks.length > 1) {
      const updatedBlocks = blocks.filter(block => block.id !== blockId);
      onUpdate(updatedBlocks);
    }
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-primary mb-4">Custom Workout Builder</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Create your workout by adding blocks and steps. Each block can be repeated multiple times.
        </p>
      </div>

      <div className="space-y-6">
        {blocks.map((block) => (
          <div key={block.id}>
            <BlockCard
              block={block}
              onUpdate={(updatedBlock) => updateBlock(block.id, updatedBlock)}
              onRemove={() => removeBlock(block.id)}
              canRemove={blocks.length > 1}
            />
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <button
          type="button"
          onClick={addBlock}
          className="btn btn-primary btn-lg"
        >
          Add New Block
        </button>
      </div>
    </div>
  );
};

// Submit button component
const SubmitButton = ({ disabled = true }: { disabled?: boolean }): JSX.Element => (
  <div className="w-full max-w-md">
    <button
      type="submit"
      className={`btn btn-primary btn-lg w-full ${disabled ? 'btn-disabled' : ''}`}
      disabled={disabled}
    >
      Create Workout
    </button>
  </div>
);

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
  const validateForm = () => {
    const isValid = Boolean(formData.activityType && formData.displayName &&
      (formData.goalSelectMenu !== 'custom' || formData.blocks.length > 0));
    setIsFormValid(isValid);
  };

  useEffect(() => {
    validateForm();
  }, [formData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4">
        <form onSubmit={handleSubmit} className="max-w-1/3 mx-auto">
          <div className="space-y-8">
            {/* Basic workout info */}
            <div className="card bg-base-100 shadow-xl">
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
              <div className="card bg-base-100 shadow-xl">
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
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-2xl text-primary mb-6">Workout Details</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <WorkoutNameInput
                      value={formData.displayName}
                      onChange={(value) => updateFormData({ displayName: value })}
                    />

                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text text-lg font-semibold">Location</span>
                      </label>
                      <select
                        value={formData.location}
                        onChange={(e) => updateFormData({ location: e.target.value as 'indoor' | 'outdoor' })}
                        className="select select-bordered w-full text-lg"
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

