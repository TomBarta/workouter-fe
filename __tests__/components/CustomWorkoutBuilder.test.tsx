import { vi, describe, test, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CustomWorkoutBuilder } from '@/app/landing/components/CustomWorkoutBuilder'
import { Block } from '@/app/landing/components/types'

// Mock the BlockCard component
vi.mock('@/app/landing/components/BlockCard', () => ({
    BlockCard: ({ block, onUpdate, onRemove, canRemove }: any) => (
        <div data-testid="block-card">
            <span>Block: {block.id}</span>
            <button onClick={() => onUpdate({ ...block, type: 'recovery' })}>
                Update Block
            </button>
            <button onClick={onRemove}>Remove Block</button>
        </div>
    )
}))

describe('CustomWorkoutBuilder', () => {
    const mockBlocks: Block[] = [
        {
            id: 'block-1',
            type: 'work',
            iterations: 3,
            steps: [
                {
                    id: 'step-1',
                    purpose: 'work',
                    goalType: 'open'
                }
            ]
        },
        {
            id: 'block-2',
            type: 'recovery',
            iterations: 1,
            steps: [
                {
                    id: 'step-2',
                    purpose: 'recovery',
                    goalType: 'open'
                }
            ]
        }
    ]

    const mockOnUpdate = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    test('renders title and description', () => {
        render(
            <CustomWorkoutBuilder
                blocks={mockBlocks}
                onUpdate={mockOnUpdate}
            />
        )

        expect(screen.getByText('Custom Workout Builder')).toBeInTheDocument()
        expect(screen.getByText(/Create your workout by adding blocks and steps/)).toBeInTheDocument()
    })

    test('renders all blocks', () => {
        render(
            <CustomWorkoutBuilder
                blocks={mockBlocks}
                onUpdate={mockOnUpdate}
            />
        )

        expect(screen.getByText('Block: block-1')).toBeInTheDocument()
        expect(screen.getByText('Block: block-2')).toBeInTheDocument()
    })

    test('shows add new block button', () => {
        render(
            <CustomWorkoutBuilder
                blocks={mockBlocks}
                onUpdate={mockOnUpdate}
            />
        )

        expect(screen.getByText('Add New Block')).toBeInTheDocument()
    })

    test('calls onUpdate when add new block button is clicked', () => {
        render(
            <CustomWorkoutBuilder
                blocks={mockBlocks}
                onUpdate={mockOnUpdate}
            />
        )

        const addBlockButton = screen.getByText('Add New Block')
        fireEvent.click(addBlockButton)

        expect(mockOnUpdate).toHaveBeenCalledWith([
            ...mockBlocks,
            expect.objectContaining({
                id: expect.any(String),
                type: 'work',
                iterations: 1,
                steps: expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(String),
                        purpose: 'work',
                        goalType: 'open'
                    })
                ])
            })
        ])
    })

    test('calls onUpdate when block is updated', () => {
        render(
            <CustomWorkoutBuilder
                blocks={mockBlocks}
                onUpdate={mockOnUpdate}
            />
        )

        const updateBlockButton = screen.getAllByText('Update Block')[0]
        fireEvent.click(updateBlockButton)

        expect(mockOnUpdate).toHaveBeenCalledWith([
            { ...mockBlocks[0], type: 'recovery' },
            mockBlocks[1]
        ])
    })

    test('calls onUpdate when block is removed', () => {
        render(
            <CustomWorkoutBuilder
                blocks={mockBlocks}
                onUpdate={mockOnUpdate}
            />
        )

        const removeBlockButton = screen.getAllByText('Remove Block')[0]
        fireEvent.click(removeBlockButton)

        expect(mockOnUpdate).toHaveBeenCalledWith([mockBlocks[1]])
    })

    test('does not remove block if only one block remains', () => {
        const singleBlock = [mockBlocks[0]]

        render(
            <CustomWorkoutBuilder
                blocks={singleBlock}
                onUpdate={mockOnUpdate}
            />
        )

        const removeBlockButton = screen.getByText('Remove Block')
        fireEvent.click(removeBlockButton)

        // Should not call onUpdate since we can't remove the last block
        expect(mockOnUpdate).not.toHaveBeenCalled()
    })

    test('has correct CSS classes', () => {
        render(
            <CustomWorkoutBuilder
                blocks={mockBlocks}
                onUpdate={mockOnUpdate}
            />
        )

        const container = screen.getByText('Custom Workout Builder').closest('div')
        expect(container).toHaveClass('w-full', 'max-w-4xl')
    })

    test('add new block button has correct classes', () => {
        render(
            <CustomWorkoutBuilder
                blocks={mockBlocks}
                onUpdate={mockOnUpdate}
            />
        )

        const addBlockButton = screen.getByText('Add New Block')
        expect(addBlockButton).toHaveClass('btn', 'btn-primary', 'btn-lg')
    })

    test('renders empty state correctly', () => {
        render(
            <CustomWorkoutBuilder
                blocks={[]}
                onUpdate={mockOnUpdate}
            />
        )

        expect(screen.getByText('Custom Workout Builder')).toBeInTheDocument()
        expect(screen.getByText('Add New Block')).toBeInTheDocument()
    })

    test('can add multiple blocks', () => {
        render(
            <CustomWorkoutBuilder
                blocks={mockBlocks}
                onUpdate={mockOnUpdate}
            />
        )

        const addBlockButton = screen.getByText('Add New Block')

        // Add first block
        fireEvent.click(addBlockButton)
        expect(mockOnUpdate).toHaveBeenCalledTimes(1)

        // Add second block
        fireEvent.click(addBlockButton)
        expect(mockOnUpdate).toHaveBeenCalledTimes(2)
    })

    test('maintains block order when updating', () => {
        render(
            <CustomWorkoutBuilder
                blocks={mockBlocks}
                onUpdate={mockOnUpdate}
            />
        )

        const updateBlockButton = screen.getAllByText('Update Block')[1]
        fireEvent.click(updateBlockButton)

        expect(mockOnUpdate).toHaveBeenCalledWith([
            mockBlocks[0],
            { ...mockBlocks[1], type: 'recovery' }
        ])
    })
})
