import { cleanUpPayload, Payload, setGoal, setWorkoutType } from '@/app/lib/pageActionUtils'
import { DistanceUnits, HKWorkoutActivityType, WorkoutGoalTypes, workoutType } from '@/app/utils/workouts'
import { beforeEach, describe, expect, test, vi } from 'vitest'

describe('page action helper functions', () => {
  let testPayload: Payload;

  beforeEach(() => {
    // Reset test payload before each test
    testPayload = {
      workoutType: workoutType.singleGoalWorkout,
      activityType: HKWorkoutActivityType.running,
      location: "indoor",
      displayName: 'test display name',
      goalSelectMenu: 'running',
      swimmingLocation: 'indoors'
    };
  });

  describe('setWorkoutType', () => {
    test.each([
      ['distance', workoutType.singleGoalWorkout],
      ['time', workoutType.singleGoalWorkout],
      ['calories', workoutType.singleGoalWorkout],
      ['open', workoutType.singleGoalWorkout],
      ['pacer', workoutType.pacerWorkout],
      ['custom', workoutType.customWorkout],
      [undefined, workoutType.singleGoalWorkout],
      [null, workoutType.singleGoalWorkout],
      ['', workoutType.singleGoalWorkout],
    ])('setWorkoutType(%s) should return %s', (arg, expected) => {
      expect(setWorkoutType(arg as string | undefined)).toBe(expected);
    });
  });

  describe('setGoal', () => {
    test.each([
      ['open', { type: WorkoutGoalTypes.open }],
      ['distance', { type: WorkoutGoalTypes.distance }],
      ['time', { type: WorkoutGoalTypes.time }],
      ['calories', { type: WorkoutGoalTypes.energy }],
      ['energy', { type: WorkoutGoalTypes.energy }],
      [undefined, { type: WorkoutGoalTypes.open }],
      [null, { type: WorkoutGoalTypes.open }],
      ['', { type: WorkoutGoalTypes.open }],
      ['invalid', { type: WorkoutGoalTypes.open }],
    ])('setGoal(%s) should return goal with type %s', (arg, expected) => {
      expect(setGoal(arg as string | undefined)).toMatchObject(expected);
    });
    
    test('returns goal objects with correct structure', () => {
      // Check that the returned objects have the correct structure
      const openGoal = setGoal('open');
      const distanceGoal = setGoal('distance');
      const timeGoal = setGoal('time');
      const energyGoal = setGoal('calories');
      
      expect(openGoal).toHaveProperty('type', WorkoutGoalTypes.open);
      expect(distanceGoal).toHaveProperty('type', WorkoutGoalTypes.distance);
      expect(timeGoal).toHaveProperty('type', WorkoutGoalTypes.time);
      expect(energyGoal).toHaveProperty('type', WorkoutGoalTypes.energy);
    });
  });

  describe('cleanUpPayload', () => {
    test('should remove goalSelectMenu property', () => {
      const input = { ...testPayload };
      const result = cleanUpPayload(input);
      
      expect(result).not.toHaveProperty('goalSelectMenu');
      // Original input should be unchanged
      expect(input).toHaveProperty('goalSelectMenu');
    });

    test('should return a new object', () => {
      const input = { ...testPayload };
      const result = cleanUpPayload(input);
      
      // Should be a different object reference
      expect(result).not.toBe(input);
      
      // Should contain all the expected properties
      expect(result).toEqual(expect.objectContaining({
        workoutType: input.workoutType,
        activity: input.activity,
        location: input.location,
        displayName: input.displayName,
        swimmingLocation: 'indoors'
      }));
    });

    test('should handle payload without goalSelectMenu', () => {
      const input = { ...testPayload };
      delete input.goalSelectMenu;
      
      const result = cleanUpPayload(input);
      
      // Should be a different object reference
      expect(result).not.toBe(input);
      
      // Should contain all the expected properties
      expect(result).toEqual(expect.objectContaining({
        workoutType: input.workoutType,
        activity: input.activity,
        location: input.location,
        displayName: input.displayName,
        swimmingLocation: 'indoors'
      }));
    });
    
    test('should provide default workoutType when missing', () => {
      const input = { ...testPayload };
      delete input.workoutType;
      
      const consoleSpy = vi.spyOn(console, 'warn');
      const result = cleanUpPayload(input);
      
      expect(consoleSpy).toHaveBeenCalledWith('Missing required field: workoutType');
      expect(result.workoutType).toBe(workoutType.singleGoalWorkout);
      
      consoleSpy.mockRestore();
    });
    
    test('should throw error when missing activityType', () => {
      const input = { ...testPayload };
      delete input.activityType;
      
      expect(() => cleanUpPayload(input)).toThrow('Missing required field: activityType');
    });
    
    test('should provide default location when missing', () => {
      const input = { ...testPayload };
      delete input.location;
      
      const consoleSpy = vi.spyOn(console, 'warn');
      const result = cleanUpPayload(input);
      
      expect(consoleSpy).toHaveBeenCalledWith('Missing required field: location');
      expect(result.location).toBe('indoor');
      
      consoleSpy.mockRestore();
    });
    
    test('should provide default displayName when missing', () => {
      const input = { ...testPayload };
      delete input.displayName;
      
      const consoleSpy = vi.spyOn(console, 'warn');
      const result = cleanUpPayload(input);
      
      expect(consoleSpy).toHaveBeenCalledWith('Missing required field: displayName');
      expect(result.displayName).toBe('Untitled Workout');
      
      consoleSpy.mockRestore();
    });
    
    test('should provide default goal when invalid', () => {
      const input = { ...testPayload };
      input.goal = {} as any;
      
      const consoleSpy = vi.spyOn(console, 'warn');
      const result = cleanUpPayload(input);
      
      expect(consoleSpy).toHaveBeenCalledWith('Invalid goal: missing type property');
      expect(result.goal).toEqual({ type: WorkoutGoalTypes.open });
      
      consoleSpy.mockRestore();
    });
    
    test('should always set swimmingLocation to indoors', () => {
      const input = { ...testPayload, swimmingLocation: 'outdoors' as any };
      const result = cleanUpPayload(input);
      
      expect(result.swimmingLocation).toBe('indoors');
    });
    
    test('should handle complex goal objects', () => {
      const input = { 
        ...testPayload,
        goal: { 
          type: WorkoutGoalTypes.distance,
          distance: 5,
          unit: DistanceUnits.kilometers
        }
      };
      
      const result = cleanUpPayload(input);
      expect(result.goal).toEqual(input.goal);
    });
    
    test('should handle missing swimmingLocation', () => {
      const input = { ...testPayload };
      delete input.swimmingLocation;
      
      const result = cleanUpPayload(input);
      expect(result.swimmingLocation).toBe('indoors');
    });
  });
});

