import { vi, describe, test, expect, beforeEach } from 'vitest'
import { createDefaultStep, createDefaultBlock, generateId } from '@/app/landing/components/utils'
import { Step, Block } from '@/app/landing/components/types'

describe('Utility Functions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('generateId', () => {
        test('generates unique IDs', () => {
            const id1 = generateId()
            const id2 = generateId()

            expect(id1).toBeDefined()
            expect(id2).toBeDefined()
            expect(id1).not.toBe(id2)
            expect(typeof id1).toBe('string')
            expect(typeof id2).toBe('string')
        })

        test('generates IDs with correct format', () => {
            const id = generateId()

            // Should be a string of alphanumeric characters
            expect(id).toMatch(/^[a-z0-9]+$/)
            expect(id.length).toBeGreaterThan(0)
        })
    })

    describe('createDefaultStep', () => {
        test('creates step with correct default values', () => {
            const step = createDefaultStep()

            expect(step).toMatchObject({
                purpose: 'work',
                goalType: 'open'
            })
            expect(step.id).toBeDefined()
            expect(typeof step.id).toBe('string')
        })

        test('generates unique ID for each step', () => {
            const step1 = createDefaultStep()
            const step2 = createDefaultStep()

            expect(step1.id).not.toBe(step2.id)
        })

        test('returns valid Step object', () => {
            const step = createDefaultStep()

            expect(step).toHaveProperty('id')
            expect(step).toHaveProperty('purpose')
            expect(step).toHaveProperty('goalType')

            // Optional properties should be undefined
            expect(step.distanceValue).toBeUndefined()
            expect(step.distanceUnit).toBeUndefined()
            expect(step.caloriesValue).toBeUndefined()
            expect(step.caloriesUnit).toBeUndefined()
            expect(step.timeHours).toBeUndefined()
            expect(step.timeMinutes).toBeUndefined()
            expect(step.timeSeconds).toBeUndefined()
        })
    })

    describe('createDefaultBlock', () => {
        test('creates block with correct default values', () => {
            const block = createDefaultBlock()

            expect(block).toMatchObject({
                type: 'work',
                iterations: 1
            })
            expect(block.id).toBeDefined()
            expect(typeof block.id).toBe('string')
            expect(Array.isArray(block.steps)).toBe(true)
        })

        test('generates unique ID for each block', () => {
            const block1 = createDefaultBlock()
            const block2 = createDefaultBlock()

            expect(block1.id).not.toBe(block2.id)
        })

        test('creates block with one default step', () => {
            const block = createDefaultBlock()

            expect(block.steps).toHaveLength(1)
            expect(block.steps[0]).toMatchObject({
                purpose: 'work',
                goalType: 'open'
            })
            expect(block.steps[0].id).toBeDefined()
        })

        test('returns valid Block object', () => {
            const block = createDefaultBlock()

            expect(block).toHaveProperty('id')
            expect(block).toHaveProperty('type')
            expect(block).toHaveProperty('iterations')
            expect(block).toHaveProperty('steps')

            expect(typeof block.id).toBe('string')
            expect(typeof block.type).toBe('string')
            expect(typeof block.iterations).toBe('number')
            expect(Array.isArray(block.steps)).toBe(true)
        })

        test('step within block has unique ID', () => {
            const block = createDefaultBlock()

            expect(block.steps[0].id).toBeDefined()
            expect(block.steps[0].id).not.toBe(block.id)
        })
    })

    describe('function integration', () => {
        test('createDefaultBlock uses createDefaultStep', () => {
            const block = createDefaultBlock()

            expect(block.steps[0]).toMatchObject({
                purpose: 'work',
                goalType: 'open'
            })
        })

        test('all generated IDs are unique across functions', () => {
            const step = createDefaultStep()
            const block = createDefaultBlock()

            const allIds = [
                step.id,
                block.id,
                ...block.steps.map(s => s.id)
            ]

            // All IDs should be unique
            const uniqueIds = new Set(allIds)
            expect(uniqueIds.size).toBe(allIds.length)
        })
    })
})
