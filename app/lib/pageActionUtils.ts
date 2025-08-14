import { WorkoutGoalTypes, WorkoutPlan, workoutType } from "../utils/workouts"

export interface Payload extends WorkoutPlan {
    swimmingLocation: 'indoors'
    goalSelectMenu?: string
    hrs?: number
    min?: number
    sec?: number
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
            return { type: WorkoutGoalTypes.distance, targetValue, unit }
        case 'time':
            const { hrs = 0, min = 0, sec = 0 } = payload
            // Convert string values to numbers if needed
            const hoursNum = typeof hrs === 'string' ? parseInt(hrs) : (hrs || 0)
            const minsNum = typeof min === 'string' ? parseInt(min) : (min || 0)
            const secsNum = typeof sec === 'string' ? parseInt(sec) : (sec || 0)
            
            const timeInSeconds = (hoursNum * 3600) + (minsNum * 60) + secsNum
            return { type: WorkoutGoalTypes.time, unit: 'seconds', targetDuration: timeInSeconds }
        case 'energy':
        case 'calories':
            return { type: WorkoutGoalTypes.energy, unit, targetValue }
        case 'open':
            return { type: WorkoutGoalTypes.open }
    }
    return { type: WorkoutGoalTypes.open }
}

export function cleanUpPayload(payload: Payload): WorkoutPlan {
    // Create a new object to avoid modifying the original
    const result = { ...payload };

    // Ensure swimmingLocation is set
    result.swimmingLocation = 'indoors';

    // Remove goalSelectMenu property
    const { goalSelectMenu: _, ...cleanPayload } = result;

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
    }

    // Return a new object without the goalSelectMenu property
    return cleanPayload as WorkoutPlan;
}
