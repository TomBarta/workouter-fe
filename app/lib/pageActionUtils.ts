import { WorkoutGoalTypes, WorkoutPlan, workoutType, IntervalBlock, IntervalStepPurpose, DistanceUnits, EnergyUnits } from "../utils/workouts"

// Types for form data
export interface WorkoutGoals {
    distance?: { distanceValue?: number; distanceUnit?: DistanceUnits }
    calories?: { calorieValue?: number; calorieUnit?: EnergyUnits }
    time?: { timeHours?: number; timeMinutes?: number; timeSeconds?: number }
}

export interface FormBlock {
    type: 'work' | 'recovery'
    iterations: number
    steps: Array<{
        purpose: string
        goalType?: string
        distanceValue?: number
        distanceUnit?: string
        caloriesValue?: number
        caloriesUnit?: string
        timeHours?: number
        timeMinutes?: number
        timeSeconds?: number
    }>
}

export interface WorkoutFormData {
    activityType: string
    location: 'indoor' | 'outdoor'
    displayName: string
    swimmingLocation: 'indoors'
    workoutType: string
    goalSelectMenu?: string
    blocks: FormBlock[]
}

export interface Payload extends WorkoutPlan {
    swimmingLocation: 'indoors'
    goalSelectMenu?: string
    hrs?: number
    min?: number
    sec?: number
    unit?: string
    targetValue?: number
    [key: string]: any // Allow dynamic properties for step data
}

/**
 * Creates a workout payload from form data and goals, supporting both nested and flat formats
 */
export function createWorkoutPayload(
    formData: WorkoutFormData, 
    goals: WorkoutGoals,
    useNestedFormat = true
): Payload {
    const payload: Payload = {
        activityType: formData.activityType,
        location: formData.location,
        displayName: formData.displayName,
        swimmingLocation: formData.swimmingLocation,
        workoutType: formData.workoutType,
        goalSelectMenu: formData.goalSelectMenu || '',
    };

    // Add goal-specific values
    if (formData.goalSelectMenu === 'distance' && goals.distance) {
        payload.targetValue = goals.distance.distanceValue?.toString() || '';
        payload.unit = goals.distance.distanceUnit || DistanceUnits.meters;
    } else if (formData.goalSelectMenu === 'calories' && goals.calories) {
        payload.targetValue = goals.calories.calorieValue?.toString() || '';
        payload.unit = goals.calories.calorieUnit || EnergyUnits.calories;
    } else if (formData.goalSelectMenu === 'time' && goals.time) {
        payload.hrs = goals.time.timeHours?.toString() || '0';
        payload.min = goals.time.timeMinutes?.toString() || '0';
        payload.sec = goals.time.timeSeconds?.toString() || '0';
    }

    // Add block and step data
    if (useNestedFormat) {
        // Use nested object format
        payload.blocks = formData.blocks.map(block => ({
            type: block.type,
            iterations: block.iterations,
            steps: block.steps.map(step => {
                const stepData: {
                    purpose: string
                    goalType?: string
                    distanceValue?: number
                    distanceUnit?: string
                    caloriesValue?: number
                    caloriesUnit?: string
                    timeHours?: number
                    timeMinutes?: number
                    timeSeconds?: number
                } = {
                    purpose: step.purpose
                };

                if (step.goalType && step.goalType !== 'open') {
                    stepData.goalType = step.goalType;

                    if (step.goalType === 'distance') {
                        if (step.distanceValue) stepData.distanceValue = step.distanceValue;
                        if (step.distanceUnit) stepData.distanceUnit = step.distanceUnit;
                    } else if (step.goalType === 'calories') {
                        if (step.caloriesValue) stepData.caloriesValue = step.caloriesValue;
                        if (step.caloriesUnit) stepData.caloriesUnit = step.caloriesUnit;
                    } else if (step.goalType === 'time') {
                        if (step.timeHours) stepData.timeHours = step.timeHours;
                        if (step.timeMinutes) stepData.timeMinutes = step.timeMinutes;
                        if (step.timeSeconds) stepData.timeSeconds = step.timeSeconds;
                    }
                }

                return stepData;
            })
        }));
    } else {
        // Use flat format for backward compatibility
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
    }

    return payload;
}

export function setWorkoutType(goalSelectMenu: string | undefined) {
    switch (goalSelectMenu) {
        case 'distance':
        case 'time':
        case 'calories':
        case 'open':
            return workoutType.singleGoalWorkout
        case 'pacer':
            return workoutType.pacerWorkout
        case 'custom':
            return workoutType.customWorkout
    }
    return workoutType.singleGoalWorkout
}

export function setGoal(payload: Payload): WorkoutPlan['goal'] {
    const { goalSelectMenu, unit, targetValue } = payload
    switch (goalSelectMenu) {
        case 'distance':
            return { type: WorkoutGoalTypes.distance, targetValue, unit: unit as any }
        case 'time':
            const { hrs = 0, min = 0, sec = 0 } = payload
            // Convert string values to numbers if needed
            const hoursNum = typeof hrs === 'string' ? parseInt(hrs) : (hrs || 0)
            const minsNum = typeof min === 'string' ? parseInt(min) : (min || 0)
            const secsNum = typeof sec === 'string' ? parseInt(sec) : (sec || 0)

            const timeInSeconds = (hoursNum * 3600) + (minsNum * 60) + secsNum
            return { type: WorkoutGoalTypes.time, unit: 'seconds' as any, targetDuration: timeInSeconds }
        case 'energy':
        case 'calories':
            return { type: WorkoutGoalTypes.energy, unit: unit as any, targetValue }
        case 'open':
            return { type: WorkoutGoalTypes.open }
    }
    return { type: WorkoutGoalTypes.open }
}

export function cleanUpPayload(payload: Payload): WorkoutPlan {
    // Create a new object to avoid modifying the original
    let result = { ...payload };

    // Ensure swimmingLocation is set
    result.swimmingLocation = 'indoors';

    // Handle custom workout blocks
    if (result.goalSelectMenu === 'custom' && result.blocks) {
        // Convert form blocks to IntervalBlocks format
        result.blocks = convertFormBlocksToIntervalBlocks(result.blocks);
    }

    // Remove raw steps and blocks form fields
    result = removeRawStepsAndBlocks(result)

    // Remove goalSelectMenu property
    const { goalSelectMenu, ...cleanPayload } = result;

    // Validate required fields
    if (!cleanPayload.workoutType) {
        console.warn('Missing required field: workoutType');
        cleanPayload.workoutType = workoutType.singleGoalWorkout;
    }

    if (!cleanPayload.activityType) {
        throw new Error('Missing required field: activityType');
    }

    if (!cleanPayload.location) {
        console.warn('Missing required field: location');
        cleanPayload.location = 'indoor';
    }

    if (!cleanPayload.displayName) {
        console.warn('Missing required field: displayName');
        cleanPayload.displayName = 'Untitled Workout';
    }

    // Validate goal if it exists
    if (cleanPayload.goal && !cleanPayload.goal.type) {
        console.warn('Invalid goal: missing type property');
        cleanPayload.goal = { type: WorkoutGoalTypes.open };
    } else if (!cleanPayload.goal) {
        // If no goal exists, create a default one
        cleanPayload.goal = { type: WorkoutGoalTypes.open };
    }

    // Return a new object without the goalSelectMenu property
    return cleanPayload as WorkoutPlan;
}

// Helper function to convert form blocks to IntervalBlocks format
function convertFormBlocksToIntervalBlocks(formBlocks: any[]): IntervalBlock[] {
    return formBlocks.map(block => ({
        type: block.type as 'work' | 'recovery',
        iterations: block.iterations || 1,
        steps: block.steps.map((step: any) => {
            const intervalStep: any = {
                purpose: step.purpose === 'work' ? IntervalStepPurpose.work : IntervalStepPurpose.recovery,
                alert: null
            };

            // Set goal based on step goal type
            if (step.goalType) {
                switch (step.goalType) {
                    case 'distance':
                        intervalStep.goal = {
                            type: WorkoutGoalTypes.distance,
                            targetValue: step.distanceValue || 0,
                            unit: step.distanceUnit || DistanceUnits.meters
                        };
                        break;
                    case 'energy':
                        intervalStep.goal = {
                            type: WorkoutGoalTypes.energy,
                            targetValue: step.caloriesValue || 0,
                            unit: step.caloriesUnit || EnergyUnits.calories
                        };
                        break;
                    case 'time':
                        const hours = step.timeHours || 0;
                        const minutes = step.timeMinutes || 0;
                        const seconds = step.timeSeconds || 0;
                        const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
                        intervalStep.goal = {
                            type: WorkoutGoalTypes.time,
                            targetDuration: totalSeconds,
                            unit: 'seconds'
                        };
                        break;
                    case 'open':
                    default:
                        intervalStep.goal = { type: WorkoutGoalTypes.open };
                        break;
                }
            } else {
                intervalStep.goal = { type: WorkoutGoalTypes.open };
            }

            return intervalStep;
        })
    }));
}

// Helper function to create blocks from form data (legacy flat format)
function createBlocksFromFormData(payload: Payload): IntervalBlock[] {
    const blocks: IntervalBlock[] = [];

    // Find all block and step-related form fields
    const blockEntries = Object.entries(payload).filter(([key]) => key.startsWith('block-'));
    const stepEntries = Object.entries(payload).filter(([key]) => key.startsWith('step-'));

    // Group by block index
    const blockGroups = new Map<string, { [key: string]: any }>();

    // Process block entries
    blockEntries.forEach(([key, value]) => {
        const parts = key.split('-');
        const blockIndex = parts[1];
        const fieldType = parts[2];

        if (!blockGroups.has(blockIndex)) {
            blockGroups.set(blockIndex, {});
        }

        blockGroups.get(blockIndex)![fieldType] = value;
    });

    // Process step entries - group by step index and find which block they belong to
    const stepGroups = new Map<number, { [key: string]: any }>();

    stepEntries.forEach(([key, value]) => {
        const parts = key.split('-');
        const stepIndex = parseInt(parts[1]);
        const fieldType = parts[2];

        if (!isNaN(stepIndex)) {
            if (!stepGroups.has(stepIndex)) {
                stepGroups.set(stepIndex, {});
            }
            stepGroups.get(stepIndex)![fieldType] = value;
        }
    });

    // For now, assume all steps belong to block 0
    // In a more complex implementation, you could determine block membership based on form structure
    const blockIndex = '0';
    if (!blockGroups.has(blockIndex)) {
        blockGroups.set(blockIndex, {});
    }

    if (!blockGroups.get(blockIndex)!.steps) {
        blockGroups.get(blockIndex)!.steps = [];
    }

    // Only add steps that have a purpose (valid steps)
    stepGroups.forEach((stepData, stepIndex) => {
        if (stepData.purpose) {
            blockGroups.get(blockIndex)!.steps[stepIndex] = stepIndex;
        }
    });



    // Convert to IntervalBlock format
    blockGroups.forEach((blockData, blockIndex) => {
        if (blockData.type && blockData.steps) {
            const stepsWithGoals = blockData.steps
                .filter((stepIndex: number) => !isNaN(stepIndex))
                .map((stepIndex: number) => {
                    // Create the step object
                    const step = createIntervalStepFromFormData(payload, stepIndex);

                    // Add the goal key based on the goal-type for that block/step
                    // Try to get the goal type for this step
                    // The convention is: step-{stepIndex}-goal-type
                    const goalTypeKey = `step-${stepIndex}-goal-type`;
                    const goalType = payload[goalTypeKey];

                    if (goalType) {
                        // Build the goal object based on the goalType and add to step
                        switch (goalType) {
                            case 'distance':
                                step.goal = {
                                    type: 'distance',
                                    targetValue: Number(payload[`step-${stepIndex}-distance-value`]),
                                    unit: payload[`step-${stepIndex}-distance-unit`] || 'm'
                                };
                                break;
                            case 'calories':
                                step.goal = {
                                    type: 'energy',
                                    targetValue: Number(payload[`step-${stepIndex}-calories-value`]),
                                    unit: payload[`step-${stepIndex}-calories-unit`] || 'kcal'
                                };
                                break;
                            case 'time':
                                step.goal = {
                                    type: 'time',
                                    hours: Number(payload[`step-${stepIndex}-time-hours`] || 0),
                                    minutes: Number(payload[`step-${stepIndex}-time-minutes`] || 0),
                                    seconds: Number(payload[`step-${stepIndex}-time-seconds`] || 0)
                                };
                                break;
                            default:
                                step.goal = { type: 'open' };
                        }
                    } else {
                        // If no goal type, default to open
                        step.goal = { type: 'open' };
                    }

                    return step;
                })
                .filter(Boolean) as any[];

            const block: IntervalBlock = {
                type: blockData.type as 'work' | 'recovery',
                iterations: parseInt(blockData.iterations) || 1,
                steps: stepsWithGoals
            };

            blocks.push(block);
        }
    });

    return blocks;
}


// Helper function to create an interval step from form data
function createIntervalStepFromFormData(payload: Payload, stepIndex: number): any {
    const purpose = payload[`step-${stepIndex}-purpose`];
    if (!purpose) return null;

    // For now, return a basic step structure
    // You can expand this to include goals, alerts, etc. based on your needs
    return {
        purpose,
        goal: { type: WorkoutGoalTypes.open },
        alert: null // You can add alert logic here if needed
    };
}
// Helper function to remove the raw step and block form data
function removeRawStepsAndBlocks(payload: Payload): Payload {
    Object.keys(payload).forEach(key => {
        if (key.includes('step-') || key.includes('block-')) {
            delete payload[key]
        }
    })
    return payload
}