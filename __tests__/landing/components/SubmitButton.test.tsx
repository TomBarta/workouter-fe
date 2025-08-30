import { vi, describe, test, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SubmitButton } from '@/app/landing/components/SubmitButton'

describe('SubmitButton', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    test('renders with correct text', () => {
        const { container } = render(<SubmitButton disabled={false} />)

        expect(container.textContent).toContain('Create Workout')
    })

    test('renders as button element', () => {
        const { container } = render(<SubmitButton disabled={false} />)

        const button = container.querySelector('button')
        expect(button).toBeTruthy()
    })

    test('has submit type', () => {
        const { container } = render(<SubmitButton disabled={false} />)

        const button = container.querySelector('button')
        expect(button?.getAttribute('type')).toBe('submit')
    })

    test('is enabled by default when disabled prop is false', () => {
        const { container } = render(<SubmitButton disabled={false} />)

        const button = container.querySelector('button')
        expect(button?.disabled).toBe(false)
    })

    test('is disabled when disabled prop is true', () => {
        const { container } = render(<SubmitButton disabled={true} />)

        const button = container.querySelector('button')
        expect(button?.disabled).toBe(true)
    })

    test('is disabled by default when no disabled prop provided', () => {
        const { container } = render(<SubmitButton />)

        const button = container.querySelector('button')
        expect(button?.disabled).toBe(true)
    })

    test('has correct CSS classes when enabled', () => {
        const { container } = render(<SubmitButton disabled={false} />)

        const button = container.querySelector('button')
        expect(button?.className).toContain('btn')
        expect(button?.className).toContain('btn-lg')
        expect(button?.className).toContain('w-full')
        expect(button?.className).toContain('btn-brand')
    })

    test('has correct CSS classes when disabled', () => {
        const { container } = render(<SubmitButton disabled={true} />)

        const button = container.querySelector('button')
        expect(button?.className).toContain('btn')
        expect(button?.className).toContain('btn-lg')
        expect(button?.className).toContain('w-full')
        expect(button?.className).toContain('bg-wktr-gray-400')
    })

    test('has correct CSS classes when disabled by default', () => {
        const { container } = render(<SubmitButton />)

        const button = container.querySelector('button')
        expect(button?.className).toContain('btn')
        expect(button?.className).toContain('btn-lg')
        expect(button?.className).toContain('w-full')
        expect(button?.className).toContain('bg-wktr-gray-400')
    })

    test('has correct container classes', () => {
        const { container } = render(<SubmitButton disabled={false} />)

        const button = container.querySelector('button')
        const buttonContainer = button?.parentElement
        expect(buttonContainer?.className).toContain('w-full')
        expect(buttonContainer?.className).toContain('max-w-md')
    })
})
