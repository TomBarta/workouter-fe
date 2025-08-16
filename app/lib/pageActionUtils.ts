import { WorkoutGoalTypes, WorkoutPlan, workoutType, IntervalBlock } from "../utils/workouts"

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
    if (result.goalSelectMenu === 'custom') {
        result.blocks = createBlocksFromFormData(result);
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

// Helper function to create blocks from form data
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