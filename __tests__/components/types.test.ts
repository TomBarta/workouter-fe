import { describe, test, expect } from 'vitest'
import type { Step, Block, WorkoutFormData } from '@/app/landing/components/types'

describe('Type Definitions', () => {
    describe('Step interface', () => {
        test('allows valid work step with all properties', () => {
            const validWorkStep: Step = {
                id: 'step-1',
                purpose: 'work',
                goalType: 'distance',
                distanceValue: 5.5,
                distanceUnit: 'miles',
                caloriesValue: undefined,
                caloriesUnit: undefined,
                timeHours: undefined,
                timeMinutes: undefined,
                timeSeconds: undefined
            }

            expect(validWorkStep.purpose).toBe('work')
            expect(validWorkStep.goalType).toBe('distance')
            expect(validWorkStep.distanceValue).toBe(5.5)
            expect(validWorkStep.distanceUnit).toBe('miles')
        })

        test('allows valid recovery step', () => {
            const validRecoveryStep: Step = {
                id: 'step-2',
                purpose: 'recovery',
                timeMinutes: 2,
                timeSeconds: 30
            }

            expect(validRecoveryStep.purpose).toBe('recovery')
            expect(validRecoveryStep.timeMinutes).toBe(2)
            expect(validRecoveryStep.timeSeconds).toBe(30)
        })

        test('allows step with open goal', () => {
            const openGoalStep: Step = {
                id: 'step-3',
                purpose: 'work',
                goalType: 'open'
            }

            expect(openGoalStep.goalType).toBe('open')
        })

        test('allows step with calories goal', () => {
            const caloriesStep: Step = {
                id: 'step-4',
                purpose: 'work',
                goalType: 'calories',
                caloriesValue: 500,
                caloriesUnit: 'calories'
            }

            expect(caloriesStep.goalType).toBe('calories')
            expect(caloriesStep.caloriesValue).toBe(500)
            expect(caloriesStep.caloriesUnit).toBe('calories')
        })

        test('allows step with time goal', () => {
            const timeStep: Step = {
                id: 'step-5',
                purpose: 'work',
                goalType: 'time',
                timeHours: 1,
                timeMinutes: 30,
                timeSeconds: 45
            }

            expect(timeStep.goalType).toBe('time')
            expect(timeStep.timeHours).toBe(1)
            expect(timeStep.timeMinutes).toBe(30)
            expect(timeStep.timeSeconds).toBe(45)
        })

        test('allows minimal step with only required properties', () => {
            const minimalStep: Step = {
                id: 'step-6',
                purpose: 'work'
            }

            expect(minimalStep.id).toBe('step-6')
            expect(minimalStep.purpose).toBe('work')
            expect(minimalStep.goalType).toBeUndefined()
        })
    })

    describe('Block interface', () => {
        test('allows valid work block', () => {
            const validWorkBlock: Block = {
                id: 'block-1',
                type: 'work',
                iterations: 5,
                steps: [
                    {
                        id: 'step-1',
                        purpose: 'work',
                        goalType: 'distance',
                        distanceValue: 1,
                        distanceUnit: 'miles'
                    },
                    {
                        id: 'step-2',
                        purpose: 'recovery',
                        timeMinutes: 1
                    }
                ]
            }

            expect(validWorkBlock.type).toBe('work')
            expect(validWorkBlock.iterations).toBe(5)
            expect(validWorkBlock.steps).toHaveLength(2)
        })

        test('allows valid recovery block', () => {
            const validRecoveryBlock: Block = {
                id: 'block-2',
                type: 'recovery',
                iterations: 1,
                steps: [
                    {
                        id: 'step-3',
                        purpose: 'recovery',
                        timeMinutes: 5
                    }
                ]
            }

            expect(validRecoveryBlock.type).toBe('recovery')
            expect(validRecoveryBlock.iterations).toBe(1)
            expect(validRecoveryBlock.steps).toHaveLength(1)
        })

        test('allows block with single step', () => {
            const singleStepBlock: Block = {
                id: 'block-3',
                type: 'work',
                iterations: 1,
                steps: [
                    {
                        id: 'step-4',
                        purpose: 'work',
                        goalType: 'open'
                    }
                ]
            }

            expect(singleStepBlock.steps).toHaveLength(1)
        })

        test('allows block with multiple steps', () => {
            const multiStepBlock: Block = {
                id: 'block-4',
                type: 'work',
                iterations: 3,
                steps: [
                    { id: 'step-5', purpose: 'work', goalType: 'open' },
                    { id: 'step-6', purpose: 'recovery', timeMinutes: 1 },
                    { id: 'step-7', purpose: 'work', goalType: 'time', timeMinutes: 10 }
                ]
            }

            expect(multiStepBlock.steps).toHaveLength(3)
            expect(multiStepBlock.iterations).toBe(3)
        })
    })

    describe('WorkoutFormData interface', () => {
        test('allows valid workout form data', () => {
            const validWorkoutData: WorkoutFormData = {
                activityType: 'running',
                location: 'outdoor',
                displayName: 'Morning 5K',
                swimmingLocation: 'indoors',
                workoutType: 'singleGoalWorkout',
                goalSelectMenu: 'distance',
                blocks: [
                    {
                        id: 'block-1',
                        type: 'work',
                        iterations: 1,
                        steps: [
                            {
                                id: 'step-1',
                                purpose: 'work',
                                goalType: 'distance',
                                distanceValue: 5,
                                distanceUnit: 'kilometers'
                            }
                        ]
                    }
                ]
            }

            expect(validWorkoutData.activityType).toBe('running')
            expect(validWorkoutData.location).toBe('outdoor')
            expect(validWorkoutData.displayName).toBe('Morning 5K')
            expect(validWorkoutData.blocks).toHaveLength(1)
        })

        test('allows indoor workout', () => {
            const indoorWorkout: WorkoutFormData = {
                activityType: 'cycling',
                location: 'indoor',
                displayName: 'Indoor Cycling',
                swimmingLocation: 'indoors',
                workoutType: 'customInterval',
                goalSelectMenu: 'custom',
                blocks: []
            }

            expect(indoorWorkout.location).toBe('indoor')
        })

        test('allows custom workout without blocks', () => {
            const customWorkout: WorkoutFormData = {
                activityType: 'swimming',
                location: 'indoor',
                displayName: 'Swim Training',
                swimmingLocation: 'indoors',
                workoutType: 'customInterval',
                goalSelectMenu: 'custom',
                blocks: []
            }

            expect(customWorkout.goalSelectMenu).toBe('custom')
            expect(customWorkout.blocks).toHaveLength(0)
        })

        test('allows workout with optional goalSelectMenu', () => {
            const workoutWithoutGoal: WorkoutFormData = {
                activityType: 'walking',
                location: 'outdoor',
                displayName: 'Evening Walk',
                swimmingLocation: 'indoors',
                workoutType: 'singleGoalWorkout',
                blocks: []
            }

            expect(workoutWithoutGoal.goalSelectMenu).toBeUndefined()
        })
    })

    describe('Type constraints', () => {
        test('Step purpose must be work or recovery', () => {
            // This should cause a TypeScript error if uncommented:
            // const invalidStep: Step = {
            //   id: 'step-1',
            //   purpose: 'invalid' // Type '"invalid"' is not assignable to type '"work" | "recovery"'
            // }

            // Instead, test valid values
            const validPurposes: Array<Step['purpose']> = ['work', 'recovery']
            expect(validPurposes).toContain('work')
            expect(validPurposes).toContain('recovery')
        })

        test('Block type must be work or recovery', () => {
            const validTypes: Array<Block['type']> = ['work', 'recovery']
            expect(validTypes).toContain('work')
            expect(validTypes).toContain('recovery')
        })

        test('Location must be indoor or outdoor', () => {
            const validLocations: Array<WorkoutFormData['location']> = ['indoor', 'outdoor']
            expect(validLocations).toContain('indoor')
            expect(validLocations).toContain('outdoor')
        })

        test('Goal type must be valid enum', () => {
            const validGoalTypes: Array<NonNullable<Step['goalType']>> = ['open', 'distance', 'calories', 'time']
            expect(validGoalTypes).toContain('open')
            expect(validGoalTypes).toContain('distance')
            expect(validGoalTypes).toContain('calories')
            expect(validGoalTypes).toContain('time')
        })
    })
})
