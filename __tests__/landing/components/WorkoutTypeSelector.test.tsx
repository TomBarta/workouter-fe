import { vi, describe, test, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WorkoutTypeSelector } from '@/app/landing/components/WorkoutTypeSelector'

describe('WorkoutTypeSelector', () => {
    const mockOnChange = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    test('renders with placeholder text', () => {
        const { container } = render(<WorkoutTypeSelector value="" onChange={mockOnChange} />)

        const select = container.querySelector('select')
        const placeholderOption = select?.querySelector('option[value=""]')
        expect(placeholderOption?.textContent).toBe('Workout type...')
    })

    test('renders all workout type options', () => {
        const { container } = render(<WorkoutTypeSelector value="" onChange={mockOnChange} />)

        const select = container.querySelector('select')
        const options = Array.from(select?.querySelectorAll('option') || [])
        const optionTexts = options.map(opt => opt.textContent)

        expect(optionTexts).toContain('Open Goal')
        expect(optionTexts).toContain('Distance')
        expect(optionTexts).toContain('Calories')
        expect(optionTexts).toContain('Time')
        expect(optionTexts).toContain('Custom Interval')
    })

    test('calls onChange when selection changes', () => {
        const { container } = render(<WorkoutTypeSelector value="" onChange={mockOnChange} />)

        const select = container.querySelector('select')
        fireEvent.change(select!, { target: { value: 'custom' } })

        expect(mockOnChange).toHaveBeenCalledWith('custom')
    })

    test('displays selected value', () => {
        const { container } = render(<WorkoutTypeSelector value="distance" onChange={mockOnChange} />)

        const select = container.querySelector('select') as HTMLSelectElement
        expect(select.value).toBe('distance')
    })

    test('has required attribute', () => {
        const { container } = render(<WorkoutTypeSelector value="" onChange={mockOnChange} />)

        const select = container.querySelector('select')
        expect(select?.hasAttribute('required')).toBe(true)
    })

    test('has correct CSS classes', () => {
        const { container } = render(<WorkoutTypeSelector value="" onChange={mockOnChange} />)

        const select = container.querySelector('select')
        expect(select?.className).toContain('select')
        expect(select?.className).toContain('select-bordered')
        expect(select?.className).toContain('w-full')
        expect(select?.className).toContain('text-lg')
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
