// TypeScript types for workout structure based on workouter-be API spec

export type WorkoutType =
  | "singleGoalWorkout"
  | "pacerWorkout"
  | "swimBikeRunWorkout"
  | "customWorkout";

export type ActivityType =
  | "running"
  | "swimming"
  | "biking"
  | "multisport";

export type Location = "outdoor" | "indoor";

export type AlertType =
  | "heartRateZone"
  | "pace"
  | "power"
  | "cadence";

export type GoalType =
  | "time"
  | "distance"
  | "energy"
  | "open";

export type GoalUnit =
  | "minutes"
  | "seconds"
  | "hours"
  | "meters"
  | "kilometers"
  | "miles"
  | "calories";

export type StepPurpose = "work" | "recovery" | "warmup" | "cooldown";

export type BlockType = "work" | "workRecovery" | "recovery";

export interface Alert {
  type: AlertType;
  zone?: number; // For heart rate zones (1-5)
  min?: number;  // For pace/power/cadence ranges
  max?: number;
}

export interface Goal {
  type: GoalType;
  targetDuration?: number;
  targetDistance?: number;
  targetEnergy?: number;
  unit?: GoalUnit;
}

export interface WorkoutStep {
  purpose: StepPurpose;
  alert: Alert;
  goal: Goal;
}

export interface WorkoutBlock {
  type: BlockType;
  iterations: number;
  steps: WorkoutStep[];
}

export interface WarmupCooldown {
  alert: Alert;
  goal: Goal;
}

export interface WorkoutData {
  workoutType: WorkoutType;
  activityType: ActivityType;
  location?: Location;
  displayName: string;
  warmup?: WarmupCooldown;
  blocks: WorkoutBlock[];
  cooldown?: WarmupCooldown;
}

// Database model type (extends Prisma Workout type)
export interface WorkoutWithData {
  id: string;
  userId: string;
  displayName: string;
  workoutType: string;
  activityType: string;
  location: string | null;
  workoutData: WorkoutData;
  createdAt: Date;
  updatedAt: Date;
}

// Form data for creating/editing workouts
export interface WorkoutFormData {
  displayName: string;
  workoutType: WorkoutType;
  activityType: ActivityType;
  location?: Location;
  warmup?: WarmupCooldown;
  blocks: WorkoutBlock[];
  cooldown?: WarmupCooldown;
}
