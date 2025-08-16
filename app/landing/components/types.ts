export interface Step {
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

export interface Block {
    id: string;
    type: 'work' | 'recovery';
    iterations: number;
    steps: Step[];
}

export interface WorkoutFormData {
    activityType: string;
    location: 'indoor' | 'outdoor';
    displayName: string;
    swimmingLocation: 'indoors';
    workoutType: string;
    goalSelectMenu?: string;
    blocks: Block[];
}
