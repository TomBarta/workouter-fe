import { vi, describe, test, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SubmitButton } from '@/app/landing/components/SubmitButton'

describe('SubmitButton', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    test('renders with correct text', () => {
        render(<SubmitButton disabled={false} />)

        expect(screen.getByText('Create Workout')).toBeInTheDocument()
    })

    test('renders as button element', () => {
        render(<SubmitButton disabled={false} />)

        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
    })

    test('has submit type', () => {
        render(<SubmitButton disabled={false} />)

        const button = screen.getByRole('button')
        expect(button).toHaveAttribute('type', 'submit')
    })

    test('is enabled by default when disabled prop is false', () => {
        render(<SubmitButton disabled={false} />)

        const button = screen.getByRole('button')
        expect(button).not.toBeDisabled()
    })

    test('is disabled when disabled prop is true', () => {
        render(<SubmitButton disabled={true} />)

        const button = screen.getByRole('button')
        expect(button).toBeDisabled()
    })

    test('is disabled by default when no disabled prop provided', () => {
        render(<SubmitButton />)

        const button = screen.getByRole('button')
        expect(button).toBeDisabled()
    })

    test('has correct CSS classes when enabled', () => {
        render(<SubmitButton disabled={false} />)

        const button = screen.getByRole('button')
        expect(button).toHaveClass('btn', 'btn-primary', 'btn-lg', 'w-full')
        expect(button).not.toHaveClass('btn-disabled')
    })

    test('has correct CSS classes when disabled', () => {
        render(<SubmitButton disabled={true} />)

        const button = screen.getByRole('button')
        expect(button).toHaveClass('btn', 'btn-primary', 'btn-lg', 'w-full', 'btn-disabled')
    })

    test('has correct CSS classes when disabled by default', () => {
        render(<SubmitButton />)

        const button = screen.getByRole('button')
        expect(button).toHaveClass('btn', 'btn-primary', 'btn-lg', 'w-full', 'btn-disabled')
    })

    test('has correct container classes', () => {
        render(<SubmitButton disabled={false} />)

        const container = screen.getByRole('button').parentElement
        expect(container).toHaveClass('w-full', 'max-w-md')
    })
})
