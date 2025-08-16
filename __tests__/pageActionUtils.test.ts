import { cleanUpPayload, Payload, setGoal, setWorkoutType } from '@/app/lib/pageActionUtils'
import { DistanceUnits, EnergyUnits, HKWorkoutActivityType, TimeUnits, WorkoutGoalTypes, workoutType } from '@/app/utils/workouts'
import { beforeEach, describe, expect, test, vi } from 'vitest'

describe('pageActionUtils', () => {
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
      ['invalid', workoutType.singleGoalWorkout],
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
      const payload = { ...testPayload, goalSelectMenu: arg as string | undefined };
      expect(setGoal(payload)).toMatchObject(expected);
    });
    
    test('returns goal objects with correct structure', () => {
      // Check that the returned objects have the correct structure
      const openGoal = setGoal({ ...testPayload, goalSelectMenu: 'open' });
      const distanceGoal = setGoal({ ...testPayload, goalSelectMenu: 'distance', targetValue: 5, unit: DistanceUnits.kilometers });
      const timeGoal = setGoal({ ...testPayload, goalSelectMenu: 'time', hrs: 1, min: 30, sec: 15 });
      const energyGoal = setGoal({ ...testPayload, goalSelectMenu: 'calories', targetValue: 500, unit: EnergyUnits.calories });
      
      expect(openGoal).toHaveProperty('type', WorkoutGoalTypes.open);
      expect(distanceGoal).toHaveProperty('type', WorkoutGoalTypes.distance);
      expect(distanceGoal).toHaveProperty('targetValue', 5);
      expect(distanceGoal).toHaveProperty('unit', DistanceUnits.kilometers);
      expect(timeGoal).toHaveProperty('type', WorkoutGoalTypes.time);
      expect(timeGoal).toHaveProperty('targetDuration', 5415); // 1h30m15s = 5415 seconds
      expect(timeGoal).toHaveProperty('unit', 'seconds');
      expect(energyGoal).toHaveProperty('type', WorkoutGoalTypes.energy);
      expect(energyGoal).toHaveProperty('targetValue', 500);
      expect(energyGoal).toHaveProperty('unit', EnergyUnits.calories);
    });

    test('handles time-based goals correctly', () => {
      // Test various time combinations
      const timeGoal1 = setGoal({ ...testPayload, goalSelectMenu: 'time', hrs: 1, min: 0, sec: 0 });
      const timeGoal2 = setGoal({ ...testPayload, goalSelectMenu: 'time', min: 30, sec: 0 });
      const timeGoal3 = setGoal({ ...testPayload, goalSelectMenu: 'time', sec: 45 });
      const timeGoal4 = setGoal({ ...testPayload, goalSelectMenu: 'time' }); // No time specified
      
      expect(timeGoal1).toEqual({ 
        type: WorkoutGoalTypes.time, 
        unit: 'seconds', 
        targetDuration: 3600 // 1 hour
      });
      
      expect(timeGoal2).toEqual({ 
        type: WorkoutGoalTypes.time, 
        unit: 'seconds', 
        targetDuration: 1800 // 30 minutes
      });
      
      expect(timeGoal3).toEqual({ 
        type: WorkoutGoalTypes.time, 
        unit: 'seconds', 
        targetDuration: 45 // 45 seconds
      });
      
      expect(timeGoal4).toEqual({ 
        type: WorkoutGoalTypes.time, 
        unit: 'seconds', 
        targetDuration: 0 // No time specified
      });
    });

    test('handles string time values correctly', () => {
      const timeGoal = setGoal({ 
        ...testPayload, 
        goalSelectMenu: 'time', 
        hrs: '2', 
        min: '15', 
        sec: '30' 
      });
      
      expect(timeGoal).toEqual({ 
        type: WorkoutGoalTypes.time, 
        unit: 'seconds', 
        targetDuration: 8130 // 2h15m30s = 8130 seconds
      });
    });

    test('handles distance goals with units', () => {
      const distanceGoal = setGoal({ 
        ...testPayload, 
        goalSelectMenu: 'distance', 
        targetValue: 10, 
        unit: DistanceUnits.miles 
      });
      
      expect(distanceGoal).toEqual({ 
        type: WorkoutGoalTypes.distance, 
        targetValue: 10, 
        unit: DistanceUnits.miles 
      });
    });

    test('handles energy goals with units', () => {
      const energyGoal = setGoal({ 
        ...testPayload, 
        goalSelectMenu: 'energy', 
        targetValue: 300, 
        unit: EnergyUnits.kilojoules 
      });
      
      expect(energyGoal).toEqual({ 
        type: WorkoutGoalTypes.energy, 
        targetValue: 300, 
        unit: EnergyUnits.kilojoules 
      });
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
        activityType: input.activityType,
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
        activityType: input.activityType,
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

    test('should handle custom workout blocks', () => {
      const input = {
        ...testPayload,
        goalSelectMenu: 'custom',
        'block-0-type': 'work',
        'block-0-iterations': '3',
        'step-0-purpose': 'run',
        'step-0-goal-type': 'distance',
        'step-0-distance-value': '100',
        'step-0-distance-unit': 'm',
        'step-1-purpose': 'rest',
        'step-1-goal-type': 'time',
        'step-1-time-minutes': '1',
        'step-1-time-seconds': '0'
      };
      
      const result = cleanUpPayload(input);
      
      expect(result.blocks).toBeDefined();
      expect(result.blocks).toHaveLength(1);
      expect(result.blocks![0]).toEqual({
        type: 'work',
        iterations: 3,
        steps: [
          {
            purpose: 'run',
            goal: {
              type: 'distance',
              targetValue: 100,
              unit: 'm'
            },
            alert: null
          },
          {
            purpose: 'rest',
            goal: {
              type: 'time',
              hours: 0,
              minutes: 1,
              seconds: 0
            },
            alert: null
          }
        ]
      });
    });

    test('should handle custom workout blocks with calories goals', () => {
      const input = {
        ...testPayload,
        goalSelectMenu: 'custom',
        'block-0-type': 'recovery',
        'block-0-iterations': '2',
        'step-0-purpose': 'walk',
        'step-0-goal-type': 'calories',
        'step-0-calories-value': '50',
        'step-0-calories-unit': 'kcal'
      };
      
      const result = cleanUpPayload(input);
      
      expect(result.blocks).toBeDefined();
      expect(result.blocks).toHaveLength(1);
      expect(result.blocks![0]).toEqual({
        type: 'recovery',
        iterations: 2,
        steps: [
          {
            purpose: 'walk',
            goal: {
              type: 'energy',
              targetValue: 50,
              unit: 'kcal'
            },
            alert: null
          }
        ]
      });
    });

    test('should handle custom workout blocks with open goals', () => {
      const input = {
        ...testPayload,
        goalSelectMenu: 'custom',
        'block-0-type': 'work',
        'block-0-iterations': '1',
        'step-0-purpose': 'swim'
        // No goal type specified, should default to open
      };
      
      const result = cleanUpPayload(input);
      
      expect(result.blocks).toBeDefined();
      expect(result.blocks).toHaveLength(1);
      expect(result.blocks![0]).toEqual({
        type: 'work',
        iterations: 1,
        steps: [
          {
            purpose: 'swim',
            goal: {
              type: 'open'
            },
            alert: null
          }
        ]
      });
    });

    test('should handle multiple blocks in custom workout', () => {
      const input = {
        ...testPayload,
        goalSelectMenu: 'custom',
        'block-0-type': 'work',
        'block-0-iterations': '2',
        'step-0-purpose': 'run',
        'step-0-goal-type': 'distance',
        'step-0-distance-value': '400',
        'step-0-distance-unit': 'm',
        'block-1-type': 'recovery',
        'block-1-iterations': '1',
        'step-1-purpose': 'walk',
        'step-1-goal-type': 'time',
        'step-1-time-minutes': '2'
      };
      
      const result = cleanUpPayload(input);
      
      expect(result.blocks).toBeDefined();
      expect(result.blocks).toHaveLength(2);
      
      expect(result.blocks![0]).toEqual({
        type: 'work',
        iterations: 2,
        steps: [
          {
            purpose: 'run',
            goal: {
              type: 'distance',
              targetValue: 400,
              unit: 'm'
            },
            alert: null
          }
        ]
      });
      
      expect(result.blocks![1]).toEqual({
        type: 'recovery',
        iterations: 1,
        steps: [
          {
            purpose: 'walk',
            goal: {
              type: 'time',
              hours: 0,
              minutes: 2,
              seconds: 0
            },
            alert: null
          }
        ]
      });
    });

    test('should filter out invalid step indices in custom blocks', () => {
      const input = {
        ...testPayload,
        goalSelectMenu: 'custom',
        'block-0-type': 'work',
        'block-0-iterations': '1',
        'step-0-purpose': 'run',
        'step-1-purpose': 'walk', // step-1 without proper step-0 setup
        'step-invalid-purpose': 'invalid' // invalid step index
      };
      
      const result = cleanUpPayload(input);
      
      expect(result.blocks).toBeDefined();
      expect(result.blocks).toHaveLength(1);
      expect(result.blocks![0].steps).toHaveLength(1);
      expect(result.blocks![0].steps[0].purpose).toBe('run');
    });

    test('should handle blocks without steps', () => {
      const input = {
        ...testPayload,
        goalSelectMenu: 'custom',
        'block-0-type': 'work',
        'block-0-iterations': '1'
        // No steps defined
      };
      
      const result = cleanUpPayload(input);
      
      expect(result.blocks).toBeDefined();
      expect(result.blocks).toHaveLength(0); // No valid blocks without steps
    });

    test('should handle blocks without type', () => {
      const input = {
        ...testPayload,
        goalSelectMenu: 'custom',
        'block-0-iterations': '1',
        'step-0-purpose': 'run'
        // No block type defined
      };
      
      const result = cleanUpPayload(input);
      
      expect(result.blocks).toBeDefined();
      expect(result.blocks).toHaveLength(0); // No valid blocks without type
    });

    test('should remove raw step and block form fields', () => {
      const input = {
        ...testPayload,
        goalSelectMenu: 'custom',
        'block-0-type': 'work',
        'block-0-iterations': '1',
        'step-0-purpose': 'run',
        'step-0-goal-type': 'distance',
        'step-0-distance-value': '100',
        'step-0-distance-unit': 'm',
        'raw-step-data': 'should-be-removed',
        'block-raw-data': 'should-be-removed'
      };
      
      const result = cleanUpPayload(input);
      
      // Should not contain raw form fields
      expect(result).not.toHaveProperty('raw-step-data');
      expect(result).not.toHaveProperty('block-raw-data');
      expect(result).not.toHaveProperty('block-0-type');
      expect(result).not.toHaveProperty('step-0-purpose');
      
      // Should contain processed blocks
      expect(result.blocks).toBeDefined();
      expect(result.blocks).toHaveLength(1);
    });

    test('should handle non-custom workout types without creating blocks', () => {
      const input = { ...testPayload, goalSelectMenu: 'distance' };
      const result = cleanUpPayload(input);
      
      expect(result.blocks).toBeUndefined();
    });
  });

  describe('edge cases and error handling', () => {
    test('should handle empty payload', () => {
      const input = {} as Payload;
      
      expect(() => cleanUpPayload(input)).toThrow('Missing required field: activityType');
    });

    test('should handle payload with only required fields', () => {
      const input = {
        activityType: HKWorkoutActivityType.running
      } as Payload;
      
      const result = cleanUpPayload(input);
      
      expect(result.workoutType).toBe(workoutType.singleGoalWorkout);
      expect(result.location).toBe('indoor');
      expect(result.displayName).toBe('Untitled Workout');
      expect(result.swimmingLocation).toBe('indoors');
    });

    test('should handle payload with null/undefined values', () => {
      const input = {
        ...testPayload,
        workoutType: null as any,
        location: null as any,
        displayName: null as any,
        goal: null as any
      };
      
      const consoleSpy = vi.spyOn(console, 'warn');
      const result = cleanUpPayload(input);
      
      expect(consoleSpy).toHaveBeenCalledWith('Missing required field: workoutType');
      expect(consoleSpy).toHaveBeenCalledWith('Missing required field: location');
      expect(consoleSpy).toHaveBeenCalledWith('Missing required field: displayName');
      
      expect(result.workoutType).toBe(workoutType.singleGoalWorkout);
      expect(result.location).toBe('indoor');
      expect(result.displayName).toBe('Untitled Workout');
      expect(result.goal).toEqual({ type: WorkoutGoalTypes.open });
      
      consoleSpy.mockRestore();
    });

    test('should handle string time values in custom workout steps', () => {
      const input = {
        ...testPayload,
        goalSelectMenu: 'custom',
        'block-0-type': 'work',
        'block-0-iterations': '1',
        'step-0-purpose': 'run',
        'step-0-goal-type': 'time',
        'step-0-time-hours': '1',
        'step-0-time-minutes': '30',
        'step-0-time-seconds': '45'
      };
      
      const result = cleanUpPayload(input);
      
      expect(result.blocks![0].steps[0].goal).toEqual({
        type: 'time',
        hours: 1,
        minutes: 30,
        seconds: 45
      });
    });

    test('should handle missing time values in custom workout steps', () => {
      const input = {
        ...testPayload,
        goalSelectMenu: 'custom',
        'block-0-type': 'work',
        'block-0-iterations': '1',
        'step-0-purpose': 'run',
        'step-0-goal-type': 'time'
        // No time values specified
      };
      
      const result = cleanUpPayload(input);
      
      expect(result.blocks![0].steps[0].goal).toEqual({
        type: 'time',
        hours: 0,
        minutes: 0,
        seconds: 0
      });
    });
  });
});
