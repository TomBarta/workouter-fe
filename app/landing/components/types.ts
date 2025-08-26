import { HKWorkoutActivityType, DistanceUnits, EnergyUnits, WorkoutGoalTypes, IntervalStepPurpose, workoutType } from "@/app/utils/workouts";

export interface Step {
    id: string;
    purpose: IntervalStepPurpose;
    goalType?: WorkoutGoalTypes;
    distanceValue?: number;
    distanceUnit?: DistanceUnits;
    caloriesValue?: number;
    caloriesUnit?: EnergyUnits;
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
    activityType: HKWorkoutActivityType | '';
    location: 'indoor' | 'outdoor';
    displayName: string;
    swimmingLocation: 'indoors';
    workoutType: workoutType | '';
    goalSelectMenu?: string;
    blocks: Block[];
}
