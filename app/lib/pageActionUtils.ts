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

    payload.blocks = formData.blocks.map(block => ({
        type: block.type,
        iterations: block.iterations,
        steps: block.steps.map(step => {
            const stepData: {
                purpose: string
                goalType?: string
                distanceValue?: string
                distanceUnit?: string
                caloriesValue?: string
                caloriesUnit?: string
                timeHours?: string
                timeMinutes?: string
                timeSeconds?: string
            } = {
                purpose: step.purpose
            };

            if (step?.goalType !== 'open') {
                stepData.goalType = step.goalType;

                if (step.goalType === 'distance') {
                    if (step.distanceValue) stepData.distanceValue = step.distanceValue.toString();
                    if (step.distanceUnit) stepData.distanceUnit = step.distanceUnit.toString();
                } else if (step.goalType === 'calories') {
                    if (step.caloriesValue) stepData.caloriesValue = step.caloriesValue.toString();
                    if (step.caloriesUnit) stepData.caloriesUnit = step.caloriesUnit.toString();
                } else if (step.goalType === 'time') {
                    if (step.timeHours) stepData.timeHours = step.timeHours.toString();
                    if (step.timeMinutes) stepData.timeMinutes = step.timeMinutes.toString();
                    if (step.timeSeconds) stepData.timeSeconds = step.timeSeconds.toString();
                }
            }

            return stepData;
        })
    }));
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
            console.log('step', step)
            // Set goal based on step goal type
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

            return intervalStep;
        })
    }));
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