import { vi, describe, test, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
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

    test('renders all steps', () => {
        const { container } = render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const blockCard = container.firstChild as HTMLElement
        const stepCards = within(blockCard).getAllByTestId('step-card')
        expect(stepCards).toHaveLength(2)
    })

    test('shows remove button when canRemove is true', () => {
        const { container } = render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const blockCard = container.firstChild as HTMLElement
        expect(within(blockCard).getByRole('button', { name: 'Remove' })).toBeTruthy()
    })

    test('hides remove button when canRemove is false', () => {
        const { container } = render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={false}
            />
        )

        const blockCard = container.firstChild as HTMLElement
        expect(within(blockCard).queryByRole('button', { name: 'Remove' })).toBeFalsy()
    })

    test('calls onRemove when remove button is clicked', () => {
        const { container } = render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const blockCard = container.firstChild as HTMLElement
        const removeButton = within(blockCard).getByRole('button', { name: 'Remove' })
        fireEvent.click(removeButton)

        expect(mockOnRemove).toHaveBeenCalledTimes(1)
    })

    test('calls onUpdate when block type changes', () => {
        const { container } = render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const blockCard = container.firstChild as HTMLElement
        const recoveryRadio = within(blockCard).getByRole('radio', { name: 'Recovery' })
        fireEvent.click(recoveryRadio)

        expect(mockOnUpdate).toHaveBeenCalledWith({
            ...mockBlock,
            type: 'recovery'
        })
    })

    test('calls onUpdate when iterations change', () => {
        const { container } = render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const blockCard = container.firstChild as HTMLElement
        const iterationsInput = within(blockCard).getByDisplayValue('3')
        fireEvent.change(iterationsInput, { target: { value: '5' } })

        expect(mockOnUpdate).toHaveBeenCalledWith({
            ...mockBlock,
            iterations: 5
        })
    })

    test('calls onUpdate when step is added', () => {
        const { container } = render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const blockCard = container.firstChild as HTMLElement
        const addStepButton = within(blockCard).getByRole('button', { name: 'Add Step' })
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
        const { container } = render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const blockCard = container.firstChild as HTMLElement
        const stepCards = within(blockCard).getAllByTestId('step-card')
        const firstStepCard = stepCards[0]
        const updateStepButton = within(firstStepCard).getByText('Update Step')
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
        const { container } = render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const blockCard = container.firstChild as HTMLElement
        const stepCards = within(blockCard).getAllByTestId('step-card')
        const firstStepCard = stepCards[0]
        const removeStepButton = within(firstStepCard).getByText('Remove Step')
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

        const { container } = render(
            <BlockCard
                block={singleStepBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const blockCard = container.firstChild as HTMLElement
        const stepCards = within(blockCard).getAllByTestId('step-card')
        const firstStepCard = stepCards[0]
        const removeStepButton = within(firstStepCard).getByText('Remove Step')
        fireEvent.click(removeStepButton)

        // Should not call onUpdate since we can't remove the last step
        expect(mockOnUpdate).not.toHaveBeenCalled()
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

        const blockCard = container.firstChild as HTMLElement
        expect(blockCard.className).toContain('border-wktr-orange-200')
    })

    test('displays correct iterations value', () => {
        const { container } = render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const blockCard = container.firstChild as HTMLElement
        const iterationsInput = within(blockCard).getByDisplayValue('3') as HTMLInputElement
        expect(iterationsInput.value).toBe('3')
    })

    test('iterations input has correct attributes', () => {
        const { container } = render(
            <BlockCard
                block={mockBlock}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const blockCard = container.firstChild as HTMLElement
        const iterationsInput = within(blockCard).getByDisplayValue('3') as HTMLInputElement
        expect(iterationsInput.getAttribute('type')).toBe('number')
        expect(iterationsInput.getAttribute('min')).toBe('1')
    })
})
