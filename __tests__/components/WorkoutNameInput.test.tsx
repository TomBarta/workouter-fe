import { vi, describe, test, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WorkoutNameInput } from '@/app/landing/components/WorkoutNameInput'

describe('WorkoutNameInput', () => {
    const mockOnChange = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    test('renders with placeholder text', () => {
        render(<WorkoutNameInput value="" onChange={mockOnChange} />)

        expect(screen.getByPlaceholderText('Workout name')).toBeInTheDocument()
    })

    test('calls onChange when input changes', () => {
        render(<WorkoutNameInput value="" onChange={mockOnChange} />)

        const input = screen.getByRole('textbox')
        fireEvent.change(input, { target: { value: 'Morning Run' } })

        expect(mockOnChange).toHaveBeenCalledWith('Morning Run')
    })

    test('displays current value', () => {
        render(<WorkoutNameInput value="Evening Walk" onChange={mockOnChange} />)

        const input = screen.getByRole('textbox') as HTMLInputElement
        expect(input.value).toBe('Evening Walk')
    })

    test('has required attribute', () => {
        render(<WorkoutNameInput value="" onChange={mockOnChange} />)

        const input = screen.getByRole('textbox')
        expect(input).toHaveAttribute('required')
    })

    test('has correct name attribute', () => {
        render(<WorkoutNameInput value="" onChange={mockOnChange} />)

        const input = screen.getByRole('textbox')
        expect(input).toHaveAttribute('name', 'displayName')
    })

    test('has correct input type', () => {
        render(<WorkoutNameInput value="" onChange={mockOnChange} />)

        const input = screen.getByRole('textbox')
        expect(input).toHaveAttribute('type', 'text')
    })

    test('has correct CSS classes', () => {
        render(<WorkoutNameInput value="" onChange={mockOnChange} />)

        const input = screen.getByRole('textbox')
        expect(input).toHaveClass('input', 'input-bordered', 'w-full', 'text-lg')
    })

    test('handles empty string input', () => {
        render(<WorkoutNameInput value="Initial Value" onChange={mockOnChange} />)

        const input = screen.getByRole('textbox')
        fireEvent.change(input, { target: { value: '' } })

        expect(mockOnChange).toHaveBeenCalledWith('')
    })

    test('handles special characters in input', () => {
        render(<WorkoutNameInput value="" onChange={mockOnChange} />)

        const input = screen.getByRole('textbox')
        fireEvent.change(input, { target: { value: 'Workout #1 - 5K Run!' } })

        expect(mockOnChange).toHaveBeenCalledWith('Workout #1 - 5K Run!')
    })
})
