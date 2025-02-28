import { WorkoutGoalTypes, WorkoutPlan, workoutType } from "../utils/workouts"

export interface Payload extends WorkoutPlan {
    swimmingLocation: 'indoors'
    goalSelectMenu?: string
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

export function setGoal(goalSelectMenu: string | undefined): WorkoutPlan['goal'] {
    switch (goalSelectMenu) {
        case 'distance':
            return { type: WorkoutGoalTypes.distance }
        case 'time':
            return { type: WorkoutGoalTypes.time }
        case 'energy':
        case 'calories':
            return { type: WorkoutGoalTypes.energy }
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
        console.warn('Missing required field: activityType');
        cleanPayload.activityType = 'running';
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
