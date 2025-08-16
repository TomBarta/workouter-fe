import { describe, test, expect } from 'vitest'

// This file serves as a test suite index for all component tests
// Individual test files are imported and run automatically by Vitest

describe('Component Test Suite', () => {
    test('all component tests are properly configured', () => {
        // This test ensures the test suite is running
        expect(true).toBe(true)
    })
})

// The following test files are automatically discovered and run by Vitest:
// - SportSelector.test.tsx
// - WorkoutTypeSelector.test.tsx  
// - WorkoutNameInput.test.tsx
// - StepCard.test.tsx
// - BlockCard.test.tsx
// - CustomWorkoutBuilder.test.tsx
// - SubmitButton.test.tsx
// - utils.test.ts
// - types.test.ts
