import { vi, describe, test, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SportSelector } from '@/app/landing/components/SportSelector'

// Mock the activities function
vi.mock('@/app/utils/workouts', () => ({
    activities: () => [
        ['running', 'Running'],
        ['cycling', 'Cycling'],
        ['swimming', 'Swimming'],
        ['walking', 'Walking']
    ]
}))

describe('SportSelector', () => {
    const mockOnChange = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    test('renders with placeholder text', () => {
        render(<SportSelector value="" onChange={mockOnChange} />)

        expect(screen.getByText('Sport...')).toBeInTheDocument()
    })

    test('renders all activity options', () => {
        render(<SportSelector value="" onChange={mockOnChange} />)

        expect(screen.getByText('Running')).toBeInTheDocument()
        expect(screen.getByText('Cycling')).toBeInTheDocument()
        expect(screen.getByText('Swimming')).toBeInTheDocument()
        expect(screen.getByText('Walking')).toBeInTheDocument()
    })

    test('calls onChange when selection changes', () => {
        render(<SportSelector value="" onChange={mockOnChange} />)

        const select = screen.getByRole('combobox')
        fireEvent.change(select, { target: { value: 'running' } })

        expect(mockOnChange).toHaveBeenCalledWith('running')
    })

    test('displays selected value', () => {
        render(<SportSelector value="cycling" onChange={mockOnChange} />)

        const select = screen.getByRole('combobox') as HTMLSelectElement
        expect(select.value).toBe('cycling')
    })

    test('has required attribute', () => {
        render(<SportSelector value="" onChange={mockOnChange} />)

        const select = screen.getByRole('combobox')
        expect(select).toHaveAttribute('required')
    })

    test('has correct CSS classes', () => {
        render(<SportSelector value="" onChange={mockOnChange} />)

        const select = screen.getByRole('combobox')
        expect(select).toHaveClass('select', 'select-bordered', 'w-full', 'text-lg')
    })
})
