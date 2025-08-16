import { vi, describe, test, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WorkoutTypeSelector } from '@/app/landing/components/WorkoutTypeSelector'

describe('WorkoutTypeSelector', () => {
    const mockOnChange = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    test('renders with placeholder text', () => {
        render(<WorkoutTypeSelector value="" onChange={mockOnChange} />)

        expect(screen.getByText('Workout type...')).toBeInTheDocument()
    })

    test('renders all workout type options', () => {
        render(<WorkoutTypeSelector value="" onChange={mockOnChange} />)

        expect(screen.getByText('Open Goal')).toBeInTheDocument()
        expect(screen.getByText('Distance')).toBeInTheDocument()
        expect(screen.getByText('Calories')).toBeInTheDocument()
        expect(screen.getByText('Time')).toBeInTheDocument()
        expect(screen.getByText('Custom Interval')).toBeInTheDocument()
    })

    test('calls onChange when selection changes', () => {
        render(<WorkoutTypeSelector value="" onChange={mockOnChange} />)

        const select = screen.getByRole('combobox')
        fireEvent.change(select, { target: { value: 'custom' } })

        expect(mockOnChange).toHaveBeenCalledWith('custom')
    })

    test('displays selected value', () => {
        render(<WorkoutTypeSelector value="distance" onChange={mockOnChange} />)

        const select = screen.getByRole('combobox') as HTMLSelectElement
        expect(select.value).toBe('distance')
    })

    test('has required attribute', () => {
        render(<WorkoutTypeSelector value="" onChange={mockOnChange} />)

        const select = screen.getByRole('combobox')
        expect(select).toHaveAttribute('required')
    })

    test('has correct CSS classes', () => {
        const { container } = render(<WorkoutTypeSelector value="" onChange={mockOnChange} />)

        const select = container.querySelector('select')
        expect(select).toHaveClass('select', 'select-bordered', 'w-full', 'text-lg')
    })

    test('has correct option values', () => {
        const { container } = render(<WorkoutTypeSelector value="" onChange={mockOnChange} />)

        const select = container.querySelector('select') as HTMLSelectElement
        const options = Array.from(select.options)

        expect(options[1].value).toBe('open')
        expect(options[2].value).toBe('distance')
        expect(options[3].value).toBe('calories')
        expect(options[4].value).toBe('time')
        expect(options[5].value).toBe('custom')
    })
})
