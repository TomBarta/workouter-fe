import { vi, describe, test, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
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
        const { container } = render(
            <CustomWorkoutBuilder
                blocks={mockBlocks}
                onUpdate={mockOnUpdate}
            />
        )

        const builder = container.firstChild as HTMLElement
        expect(within(builder).getByRole('heading', { name: 'Custom Workout Builder' })).toBeTruthy()
        expect(within(builder).getByText(/Create your workout by adding blocks and steps/)).toBeTruthy()
    })

    test('renders all blocks', () => {
        const { container } = render(
            <CustomWorkoutBuilder
                blocks={mockBlocks}
                onUpdate={mockOnUpdate}
            />
        )

        const builder = container.firstChild as HTMLElement
        expect(within(builder).getByText('Block: block-1')).toBeTruthy()
        expect(within(builder).getByText('Block: block-2')).toBeTruthy()
    })

    test('shows add new block button', () => {
        const { container } = render(
            <CustomWorkoutBuilder
                blocks={mockBlocks}
                onUpdate={mockOnUpdate}
            />
        )

        const builder = container.firstChild as HTMLElement
        expect(within(builder).getByRole('button', { name: 'Add New Block' })).toBeTruthy()
    })

    test('calls onUpdate when add new block button is clicked', () => {
        const { container } = render(
            <CustomWorkoutBuilder
                blocks={mockBlocks}
                onUpdate={mockOnUpdate}
            />
        )

        const builder = container.firstChild as HTMLElement
        const addBlockButton = within(builder).getByRole('button', { name: 'Add New Block' })
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
        const { container } = render(
            <CustomWorkoutBuilder
                blocks={mockBlocks}
                onUpdate={mockOnUpdate}
            />
        )

        const builder = container.firstChild as HTMLElement
        // Get the first block card and find its update button
        const firstBlockCard = within(builder).getAllByTestId('block-card')[0]
        const updateButton = within(firstBlockCard).getByText('Update Block')
        fireEvent.click(updateButton)

        expect(mockOnUpdate).toHaveBeenCalledWith([
            {
                ...mockBlocks[0],
                type: 'recovery'
            },
            mockBlocks[1]
        ])
    })

    test('calls onUpdate when block is removed', () => {
        const { container } = render(
            <CustomWorkoutBuilder
                blocks={mockBlocks}
                onUpdate={mockOnUpdate}
            />
        )

        const builder = container.firstChild as HTMLElement
        // Get the first block card and find its remove button
        const firstBlockCard = within(builder).getAllByTestId('block-card')[0]
        const removeButton = within(firstBlockCard).getByText('Remove Block')
        fireEvent.click(removeButton)

        expect(mockOnUpdate).toHaveBeenCalledWith([mockBlocks[1]])
    })

    test('renders empty state correctly', () => {
        const { container } = render(
            <CustomWorkoutBuilder
                blocks={[]}
                onUpdate={mockOnUpdate}
            />
        )

        const builder = container.firstChild as HTMLElement
        expect(within(builder).getByRole('heading', { name: 'Custom Workout Builder' })).toBeTruthy()
        expect(within(builder).getByRole('button', { name: 'Add New Block' })).toBeTruthy()
    })

    test('can add multiple blocks', () => {
        let currentBlocks: Block[] = []
        const mockOnUpdate = vi.fn((blocks: Block[]) => {
            currentBlocks = blocks
        })

        const { container, rerender } = render(
            <CustomWorkoutBuilder
                blocks={currentBlocks}
                onUpdate={mockOnUpdate}
            />
        )

        const builder = container.firstChild as HTMLElement
        const addBlockButton = within(builder).getByRole('button', { name: 'Add New Block' })

        // Add first block
        fireEvent.click(addBlockButton)

        expect(mockOnUpdate).toHaveBeenCalledWith([
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

        // Re-render with the updated blocks
        rerender(
            <CustomWorkoutBuilder
                blocks={currentBlocks}
                onUpdate={mockOnUpdate}
            />
        )

        // Add second block
        fireEvent.click(addBlockButton)

        // The second call should have 2 blocks
        expect(mockOnUpdate).toHaveBeenCalledWith([
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
            }),
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

        // Verify total number of calls
        expect(mockOnUpdate).toHaveBeenCalledTimes(2)
    })

    test('has correct CSS classes', () => {
        const { container } = render(
            <CustomWorkoutBuilder
                blocks={mockBlocks}
                onUpdate={mockOnUpdate}
            />
        )

        const builder = container.firstChild as HTMLElement
        expect(builder.className).toContain('w-full')
        expect(builder.className).toContain('max-w-4xl')
    })

    test('renders block cards with correct structure', () => {
        const { container } = render(
            <CustomWorkoutBuilder
                blocks={mockBlocks}
                onUpdate={mockOnUpdate}
            />
        )

        const builder = container.firstChild as HTMLElement
        const blockCards = within(builder).getAllByTestId('block-card')
        expect(blockCards).toHaveLength(2)
    })
})
