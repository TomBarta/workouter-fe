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
        const { container } = render(<SportSelector value="" onChange={mockOnChange} />)

        const select = container.querySelector('select')
        const placeholderOption = select?.querySelector('option[value=""]')
        expect(placeholderOption?.textContent).toBe('Sport...')
    })

    test('renders all activity options', () => {
        const { container } = render(<SportSelector value="" onChange={mockOnChange} />)

        const select = container.querySelector('select')
        const options = Array.from(select?.querySelectorAll('option') || [])
        const optionTexts = options.map(opt => opt.textContent)

        expect(optionTexts).toContain('Running')
        expect(optionTexts).toContain('Cycling')
        expect(optionTexts).toContain('Swimming')
        expect(optionTexts).toContain('Walking')
    })

    test('calls onChange when selection changes', () => {
        const { container } = render(<SportSelector value="" onChange={mockOnChange} />)

        const select = container.querySelector('select')
        fireEvent.change(select!, { target: { value: 'running' } })

        expect(mockOnChange).toHaveBeenCalledWith('running')
    })

    test('displays selected value', () => {
        const { container } = render(<SportSelector value="cycling" onChange={mockOnChange} />)

        const select = container.querySelector('select') as HTMLSelectElement
        expect(select.value).toBe('cycling')
    })

    test('has required attribute', () => {
        const { container } = render(<SportSelector value="" onChange={mockOnChange} />)

        const select = container.querySelector('select')
        expect(select?.hasAttribute('required')).toBe(true)
    })

    test('has correct CSS classes', () => {
        const { container } = render(<SportSelector value="" onChange={mockOnChange} />)

        const select = container.querySelector('select')
        expect(select?.className).toContain('select')
        expect(select?.className).toContain('select-bordered')
        expect(select?.className).toContain('w-full')
        expect(select?.className).toContain('text-lg')
    })
})
