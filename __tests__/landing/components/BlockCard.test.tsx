import { vi, describe, test, expect, beforeEach } from 'vitest'
import { render, fireEvent, within } from '@testing-library/react'
import { BlockCard } from '@/app/landing/components/BlockCard'
import { Block } from '@/app/landing/components/types'
import { IntervalStepPurpose, WorkoutGoalTypes, DistanceUnits } from '@/app/utils/workouts'

describe('BlockCard', () => {
    const mockBlock: Block = {
        id: 'block-1',
        type: 'work',
        iterations: 1,
        steps: [
            {
                id: 'step-1',
                purpose: IntervalStepPurpose.work,
                goalType: WorkoutGoalTypes.open
            }
        ]
    }

    const mockOnUpdate = vi.fn()
    const mockOnRemove = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    test('renders block with single step', () => {
        const { container } = render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        // Should render the block card
        expect(container.querySelector('.card-workout')).toBeTruthy()

        // Should render one step card (contains "Work" heading)
        const workHeadings = container.querySelectorAll('h4')
        expect(workHeadings.length).toBeGreaterThan(0)
    })

    test('shows block remove button when canRemove is true', () => {
        const { getAllByRole } = render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        // Should have at least one Remove button (the block remove button)
        const removeButtons = getAllByRole('button', { name: 'Remove' })
        expect(removeButtons.length).toBeGreaterThan(0)
    })

    test('hides block remove button when canRemove is false', () => {
        const { container } = render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={false}
            />
        )

        // Check the block card body's direct children for remove button
        const blockCardBody = container.querySelector('.card-body')
        const directButtons = blockCardBody?.querySelectorAll(':scope > button')
        expect(directButtons?.length).toBe(0)
    })

    test('calls onRemove when block remove button is clicked', () => {
        const { container } = render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        // Get the block's direct remove button (first button in card-body)
        const blockCardBody = container.querySelector('.card-body')
        const blockRemoveButton = blockCardBody?.querySelector('button')
        if (blockRemoveButton) {
            fireEvent.click(blockRemoveButton)
        }

        expect(mockOnRemove).toHaveBeenCalledTimes(1)
    })

    test('renders Add Step button', () => {
        const { container } = render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const addStepButton = within(container).getByRole('button', { name: 'Add Step' })
        expect(addStepButton).toBeTruthy()
    })

    test('adds a new step when Add Step button is clicked', () => {
        const { container } = render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const addStepButton = within(container).getByRole('button', { name: 'Add Step' })
        fireEvent.click(addStepButton)

        expect(mockOnUpdate).toHaveBeenCalledTimes(1)
        const updatedBlock = mockOnUpdate.mock.calls[0][0]
        expect(updatedBlock.steps.length).toBe(2)
        expect(updatedBlock.steps[0]).toEqual(mockBlock.steps[0])
        expect(updatedBlock.steps[1]).toHaveProperty('id')
        expect(updatedBlock.steps[1]).toHaveProperty('purpose', IntervalStepPurpose.work)
    })

    test('renders multiple steps', () => {
        const blockWithMultipleSteps: Block = {
            ...mockBlock,
            steps: [
                {
                    id: 'step-1',
                    purpose: IntervalStepPurpose.work,
                    goalType: WorkoutGoalTypes.open
                },
                {
                    id: 'step-2',
                    purpose: IntervalStepPurpose.recovery,
                    goalType: WorkoutGoalTypes.time
                },
                {
                    id: 'step-3',
                    purpose: IntervalStepPurpose.work,
                    goalType: WorkoutGoalTypes.distance
                }
            ]
        }

        const { container } = render(
            <BlockCard
                block={blockWithMultipleSteps}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        // Should render three step cards
        const headings = container.querySelectorAll('h4')
        expect(headings.length).toBe(3)
    })

    test('allows removing a step when block has multiple steps', () => {
        const blockWithTwoSteps: Block = {
            ...mockBlock,
            steps: [
                {
                    id: 'step-1',
                    purpose: IntervalStepPurpose.work,
                    goalType: WorkoutGoalTypes.open
                },
                {
                    id: 'step-2',
                    purpose: IntervalStepPurpose.recovery,
                    goalType: WorkoutGoalTypes.time
                }
            ]
        }

        const { getAllByRole } = render(
            <BlockCard
                block={blockWithTwoSteps}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        // Get all remove buttons (including block remove button)
        const removeButtons = getAllByRole('button', { name: 'Remove' })

        // Click the last step's remove button (not the block remove button)
        fireEvent.click(removeButtons[removeButtons.length - 1])

        expect(mockOnUpdate).toHaveBeenCalledTimes(1)
        const updatedBlock = mockOnUpdate.mock.calls[0][0]
        expect(updatedBlock.steps.length).toBe(1)
        expect(updatedBlock.steps[0].id).toBe('step-1')
    })

    test('does not allow removing step when block has only one step', () => {
        const { container } = render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        // With only one step, the step's remove button should not be visible
        // (canRemove is passed as false to StepCard when steps.length === 1)
        const allButtons = container.querySelectorAll('button')

        // Should have block remove button and add step button, but not step remove button
        const removeButtons = Array.from(allButtons).filter(btn => btn.textContent === 'Remove')
        expect(removeButtons.length).toBe(1) // Only block remove button
    })

    test('updates step when step is modified', () => {
        const { container } = render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        // Find the recovery radio button and click it
        const recoveryRadio = within(container).getByRole('radio', { name: 'Recovery' })
        fireEvent.click(recoveryRadio)

        expect(mockOnUpdate).toHaveBeenCalledTimes(1)
        const updatedBlock = mockOnUpdate.mock.calls[0][0]
        expect(updatedBlock.steps[0].purpose).toBe('recovery')
    })

    test('has correct CSS classes', () => {
        const { container } = render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const blockCard = container.querySelector('.card-workout')
        expect(blockCard?.className).toContain('border-wktr-orange-200')
    })

    test('Add Step button has correct styling', () => {
        const { container } = render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const addStepButton = within(container).getByRole('button', { name: 'Add Step' })
        expect(addStepButton.className).toContain('bg-wktr-orange-500')
        expect(addStepButton.className).toContain('hover:bg-wktr-orange-600')
    })

    test('preserves existing steps when adding new step', () => {
        const blockWithTwoSteps: Block = {
            ...mockBlock,
            steps: [
                {
                    id: 'step-1',
                    purpose: IntervalStepPurpose.work,
                    goalType: WorkoutGoalTypes.distance,
                    distanceValue: 100,
                    distanceUnit: DistanceUnits.meters
                },
                {
                    id: 'step-2',
                    purpose: IntervalStepPurpose.recovery,
                    goalType: WorkoutGoalTypes.time,
                    timeMinutes: 2
                }
            ]
        }

        const { container } = render(
            <BlockCard
                block={blockWithTwoSteps}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const addStepButton = within(container).getByRole('button', { name: 'Add Step' })
        fireEvent.click(addStepButton)

        expect(mockOnUpdate).toHaveBeenCalledTimes(1)
        const updatedBlock = mockOnUpdate.mock.calls[0][0]
        expect(updatedBlock.steps.length).toBe(3)

        // First two steps should be unchanged
        expect(updatedBlock.steps[0]).toEqual(blockWithTwoSteps.steps[0])
        expect(updatedBlock.steps[1]).toEqual(blockWithTwoSteps.steps[1])

        // Third step should be a new default step
        expect(updatedBlock.steps[2].purpose).toBe(IntervalStepPurpose.work)
        expect(updatedBlock.steps[2].goalType).toBe(WorkoutGoalTypes.open)
    })
})
