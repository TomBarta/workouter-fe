import { vi, describe, test, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BlockCard } from '@/app/landing/components/BlockCard'
import { Block } from '@/app/landing/components/types'

// Mock the StepCard component
vi.mock('@/app/landing/components/StepCard', () => ({
    StepCard: ({ step, onUpdate, onRemove, canRemove }: any) => (
        <div data-testid="step-card">
            <span>Step: {step.id}</span>
            <button onClick={() => onUpdate({ ...step, purpose: 'recovery' })}>
                Update Step
            </button>
            <button onClick={onRemove}>Remove Step</button>
        </div>
    )
}))

describe('BlockCard', () => {
    const mockBlock: Block = {
        id: 'block-1',
        type: 'work',
        iterations: 3,
        steps: [
            {
                id: 'step-1',
                purpose: 'work',
                goalType: 'open'
            },
            {
                id: 'step-2',
                purpose: 'recovery',
                goalType: 'open'
            }
        ]
    }

    const mockOnUpdate = vi.fn()
    const mockOnRemove = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    test('renders block title correctly', () => {
        render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        expect(screen.getByText('Block Work')).toBeInTheDocument()
    })

    test('renders recovery block title correctly', () => {
        const recoveryBlock: Block = { ...mockBlock, type: 'recovery' }

        render(
            <BlockCard
                block={recoveryBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        expect(screen.getByText('Block Recovery')).toBeInTheDocument()
    })

    test('shows remove button when canRemove is true', () => {
        render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        expect(screen.getByText('Remove')).toBeInTheDocument()
    })

    test('hides remove button when canRemove is false', () => {
        render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={false}
            />
        )

        expect(screen.queryByText('Remove')).not.toBeInTheDocument()
    })

    test('calls onRemove when remove button is clicked', () => {
        render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const removeButton = screen.getByText('Remove')
        fireEvent.click(removeButton)

        expect(mockOnRemove).toHaveBeenCalledTimes(1)
    })

    test('calls onUpdate when block type changes', () => {
        render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const recoveryRadio = screen.getByLabelText('Recovery')
        fireEvent.click(recoveryRadio)

        expect(mockOnUpdate).toHaveBeenCalledWith({
            ...mockBlock,
            type: 'recovery'
        })
    })

    test('calls onUpdate when iterations change', () => {
        render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const iterationsInput = screen.getByDisplayValue('3')
        fireEvent.change(iterationsInput, { target: { value: '5' } })

        expect(mockOnUpdate).toHaveBeenCalledWith({
            ...mockBlock,
            iterations: 5
        })
    })

    test('renders all steps', () => {
        render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        expect(screen.getByText('Step: step-1')).toBeInTheDocument()
        expect(screen.getByText('Step: step-2')).toBeInTheDocument()
    })

    test('shows add step button', () => {
        render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        expect(screen.getByText('Add Step')).toBeInTheDocument()
    })

    test('calls onUpdate when add step button is clicked', () => {
        render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const addStepButton = screen.getByText('Add Step')
        fireEvent.click(addStepButton)

        expect(mockOnUpdate).toHaveBeenCalledWith({
            ...mockBlock,
            steps: [
                ...mockBlock.steps,
                expect.objectContaining({
                    id: expect.any(String),
                    purpose: 'work',
                    goalType: 'open'
                })
            ]
        })
    })

    test('calls onUpdate when step is updated', () => {
        render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const updateStepButton = screen.getAllByText('Update Step')[0]
        fireEvent.click(updateStepButton)

        expect(mockOnUpdate).toHaveBeenCalledWith({
            ...mockBlock,
            steps: [
                { ...mockBlock.steps[0], purpose: 'recovery' },
                mockBlock.steps[1]
            ]
        })
    })

    test('calls onUpdate when step is removed', () => {
        render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const removeStepButton = screen.getAllByText('Remove Step')[0]
        fireEvent.click(removeStepButton)

        expect(mockOnUpdate).toHaveBeenCalledWith({
            ...mockBlock,
            steps: [mockBlock.steps[1]]
        })
    })

    test('does not remove step if only one step remains', () => {
        const singleStepBlock: Block = {
            ...mockBlock,
            steps: [mockBlock.steps[0]]
        }

        render(
            <BlockCard
                block={singleStepBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const removeStepButton = screen.getByText('Remove Step')
        fireEvent.click(removeStepButton)

        // Should not call onUpdate since we can't remove the last step
        expect(mockOnUpdate).not.toHaveBeenCalled()
    })

    test('has correct CSS classes', () => {
        render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const card = screen.getByText('Block Work').closest('.card')
        expect(card).toHaveClass('bg-base-100', 'shadow-xl', 'border-2', 'border-primary/20')
    })

    test('displays correct iterations value', () => {
        render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const iterationsInput = screen.getByDisplayValue('3') as HTMLInputElement
        expect(iterationsInput.value).toBe('3')
    })

    test('iterations input has correct attributes', () => {
        render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const iterationsInput = screen.getByDisplayValue('3')
        expect(iterationsInput).toHaveAttribute('type', 'number')
        expect(iterationsInput).toHaveAttribute('min', '1')
    })
})
