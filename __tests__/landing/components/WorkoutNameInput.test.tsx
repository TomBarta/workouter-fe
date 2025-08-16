import { vi, describe, test, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WorkoutNameInput } from '@/app/landing/components/WorkoutNameInput'

describe('WorkoutNameInput', () => {
    const mockOnChange = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    test('renders with placeholder text', () => {
        const { container } = render(<WorkoutNameInput value="" onChange={mockOnChange} />)

        const input = container.querySelector('input')
        expect(input?.getAttribute('placeholder')).toBe('Workout name')
    })

    test('calls onChange when input changes', () => {
        const { container } = render(<WorkoutNameInput value="" onChange={mockOnChange} />)

        const input = container.querySelector('input')
        fireEvent.change(input!, { target: { value: 'Morning Run' } })

        expect(mockOnChange).toHaveBeenCalledWith('Morning Run')
    })

    test('displays current value', () => {
        const { container } = render(<WorkoutNameInput value="Evening Walk" onChange={mockOnChange} />)

        const input = container.querySelector('input') as HTMLInputElement
        expect(input.value).toBe('Evening Walk')
    })

    test('has required attribute', () => {
        const { container } = render(<WorkoutNameInput value="" onChange={mockOnChange} />)

        const input = container.querySelector('input')
        expect(input?.hasAttribute('required')).toBe(true)
    })

    test('has correct name attribute', () => {
        const { container } = render(<WorkoutNameInput value="" onChange={mockOnChange} />)

        const input = container.querySelector('input')
        expect(input?.getAttribute('name')).toBe('displayName')
    })

    test('has correct input type', () => {
        const { container } = render(<WorkoutNameInput value="" onChange={mockOnChange} />)

        const input = container.querySelector('input')
        expect(input?.getAttribute('type')).toBe('text')
    })

    test('has correct CSS classes', () => {
        const { container } = render(<WorkoutNameInput value="" onChange={mockOnChange} />)

        const input = container.querySelector('input')
        expect(input?.className).toContain('input')
        expect(input?.className).toContain('input-bordered')
        expect(input?.className).toContain('w-full')
        expect(input?.className).toContain('text-lg')
    })

    test('handles empty string input', () => {
        const { container } = render(<WorkoutNameInput value="Initial Value" onChange={mockOnChange} />)

        const input = container.querySelector('input')
        fireEvent.change(input!, { target: { value: '' } })

        expect(mockOnChange).toHaveBeenCalledWith('')
    })

    test('handles special characters in input', () => {
        const { container } = render(<WorkoutNameInput value="" onChange={mockOnChange} />)

        const input = container.querySelector('input')
        fireEvent.change(input!, { target: { value: 'Workout #1 - 5K Run!' } })

        expect(mockOnChange).toHaveBeenCalledWith('Workout #1 - 5K Run!')
    })
})
