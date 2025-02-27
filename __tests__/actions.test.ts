import { cleanUpPayload, Payload, setGoal, setWorkoutType } from '@/app/lib/pageActionUtils'
import { HKWorkoutActivityType, WorkoutGoalTypes, workoutType } from '@/app/utils/workouts'
import { beforeEach, describe, expect, test } from 'vitest'

describe('page action helper functions', () => {
  let testPayload: Payload;

  beforeEach(() => {
    // Reset test payload before each test
    testPayload = {
      workoutType: workoutType.singleGoalWorkout,
      activity: HKWorkoutActivityType.running,
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
    
    test('should throw error when missing workoutType', () => {
      const input = { ...testPayload };
      delete input.workoutType;
      
      expect(() => cleanUpPayload(input)).toThrow('Missing required field: workoutType');
    });
    
    test('should throw error when missing activity', () => {
      const input = { ...testPayload };
      delete input.activity;
      
      expect(() => cleanUpPayload(input)).toThrow('Missing required field: activity');
    });
    
    test('should throw error when missing location', () => {
      const input = { ...testPayload };
      delete input.location;
      
      expect(() => cleanUpPayload(input)).toThrow('Missing required field: location');
    });
    
    test('should throw error when missing displayName', () => {
      const input = { ...testPayload };
      delete input.displayName;
      
      expect(() => cleanUpPayload(input)).toThrow('Missing required field: displayName');
    });
    
    test('should throw error when goal is invalid', () => {
      const input = { ...testPayload };
      input.goal = {} as any;
      
      expect(() => cleanUpPayload(input)).toThrow('Invalid goal: missing type property');
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
  });
});

