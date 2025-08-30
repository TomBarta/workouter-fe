import { vi, describe, test, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { StepCard } from '@/app/landing/components/StepCard'
import { Step } from '@/app/landing/components/types'

// Mock the DistanceUnits and EnergyUnits
vi.mock('@/app/utils/workouts', () => ({
    DistanceUnits: {
        miles: 'miles',
        kilometers: 'kilometers',
        yards: 'yards',
        meters: 'meters'
    },
    EnergyUnits: {
        calories: 'calories',
        kilocalories: 'kilocalories'
    }
}))

describe('StepCard', () => {
    const mockStep: Step = {
        id: 'step-1',
        purpose: 'work',
        goalType: 'open'
    }

    const mockOnUpdate = vi.fn()
    const mockOnRemove = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    test('renders work step correctly', () => {
        const { container } = render(
            <StepCard
                step={mockStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const stepCard = container.firstChild as HTMLElement
        expect(within(stepCard).getByRole('heading', { name: 'Work' })).toBeTruthy()
        expect(within(stepCard).getByText('Purpose')).toBeTruthy()
    })

    test('renders recovery step correctly', () => {
        const recoveryStep: Step = { ...mockStep, purpose: 'recovery' }
        const { container } = render(
            <StepCard
                step={recoveryStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const stepCard = container.firstChild as HTMLElement
        expect(within(stepCard).getByRole('heading', { name: 'Recovery' })).toBeTruthy()
    })

    test('shows remove button when canRemove is true', () => {
        const { container } = render(
            <StepCard
                step={mockStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const stepCard = container.firstChild as HTMLElement
        expect(within(stepCard).getByRole('button', { name: 'Remove' })).toBeTruthy()
    })

    test('hides remove button when canRemove is false', () => {
        const { container } = render(
            <StepCard
                step={mockStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={false}
            />
        )

        const stepCard = container.firstChild as HTMLElement
        expect(within(stepCard).queryByRole('button', { name: 'Remove' })).toBeFalsy()
    })

    test('calls onRemove when remove button is clicked', () => {
        const { container } = render(
            <StepCard
                step={mockStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const stepCard = container.firstChild as HTMLElement
        const removeButton = within(stepCard).getByRole('button', { name: 'Remove' })
        fireEvent.click(removeButton)

        expect(mockOnRemove).toHaveBeenCalledTimes(1)
    })

    test('calls onUpdate when purpose changes', () => {
        const { container } = render(
            <StepCard
                step={mockStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const stepCard = container.firstChild as HTMLElement
        const recoveryRadio = within(stepCard).getByRole('radio', { name: 'Recovery' })
        fireEvent.click(recoveryRadio)

        expect(mockOnUpdate).toHaveBeenCalledWith({
            ...mockStep,
            purpose: 'recovery'
        })
    })

    test('shows goal type selector for work steps', () => {
        const { container } = render(
            <StepCard
                step={mockStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const stepCard = container.firstChild as HTMLElement
        expect(within(stepCard).getByText('Goal Type')).toBeTruthy()
        expect(within(stepCard).getByText('Select goal...')).toBeTruthy()
    })

    test('shows distance inputs when distance goal is selected', () => {
        const distanceStep: Step = { ...mockStep, goalType: 'distance' }

        const { container } = render(
            <StepCard
                step={distanceStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const stepCard = container.firstChild as HTMLElement
        const distanceInput = within(stepCard).queryByPlaceholderText('Distance')
        expect(distanceInput).toBeTruthy()
        expect(within(stepCard).getByText('Unit')).toBeTruthy()
    })

    test('shows calories inputs when calories goal is selected', () => {
        const caloriesStep: Step = { ...mockStep, goalType: 'calories' }

        const { container } = render(
            <StepCard
                step={caloriesStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const stepCard = container.firstChild as HTMLElement
        const caloriesInput = within(stepCard).queryByPlaceholderText('Calories')
        expect(caloriesInput).toBeTruthy()
        expect(within(stepCard).getByText('Unit')).toBeTruthy()
    })

    test('shows time inputs when time goal is selected', () => {
        const timeStep: Step = { ...mockStep, goalType: 'time' }

        const { container } = render(
            <StepCard
                step={timeStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const stepCard = container.firstChild as HTMLElement
        const hoursInput = within(stepCard).queryByPlaceholderText('Hours')
        const minutesInput = within(stepCard).queryByPlaceholderText('Minutes')
        const secondsInput = within(stepCard).queryByPlaceholderText('Seconds')
        expect(hoursInput).toBeTruthy()
        expect(minutesInput).toBeTruthy()
        expect(secondsInput).toBeTruthy()
    })

    test('shows recovery duration inputs for recovery steps', () => {
        const recoveryStep: Step = { ...mockStep, purpose: 'recovery' }

        const { container } = render(
            <StepCard
                step={recoveryStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const stepCard = container.firstChild as HTMLElement
        expect(within(stepCard).getByText('Recovery Duration')).toBeTruthy()
        const minutesInput = within(stepCard).queryByPlaceholderText('Minutes')
        const secondsInput = within(stepCard).queryByPlaceholderText('Seconds')
        expect(minutesInput).toBeTruthy()
        expect(secondsInput).toBeTruthy()
    })

    test('calls onUpdate when goal type changes', () => {
        const { container } = render(
            <StepCard
                step={mockStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const stepCard = container.firstChild as HTMLElement
        const goalSelect = within(stepCard).getByRole('combobox')
        fireEvent.change(goalSelect, { target: { value: 'distance' } })

        expect(mockOnUpdate).toHaveBeenCalledWith({
            ...mockStep,
            goalType: 'distance'
        })
    })

    test('calls onUpdate when distance value changes', () => {
        const distanceStep: Step = { ...mockStep, goalType: 'distance' }

        const { container } = render(
            <StepCard
                step={distanceStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const stepCard = container.firstChild as HTMLElement
        const distanceInput = within(stepCard).getByPlaceholderText('Distance')
        fireEvent.change(distanceInput, { target: { value: '5.5' } })

        expect(mockOnUpdate).toHaveBeenCalledWith({
            ...distanceStep,
            distanceValue: 5.5
        })
    })

    test('calls onUpdate when calories value changes', () => {
        const caloriesStep: Step = { ...mockStep, goalType: 'calories' }

        const { container } = render(
            <StepCard
                step={caloriesStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const stepCard = container.firstChild as HTMLElement
        const caloriesInput = within(stepCard).getByPlaceholderText('Calories')
        fireEvent.change(caloriesInput, { target: { value: '500' } })

        expect(mockOnUpdate).toHaveBeenCalledWith({
            ...caloriesStep,
            caloriesValue: 500
        })
    })

    test('calls onUpdate when time values change', () => {
        const timeStep: Step = { ...mockStep, goalType: 'time' }

        const { container } = render(
            <StepCard
                step={timeStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const stepCard = container.firstChild as HTMLElement
        const minutesInput = within(stepCard).getByPlaceholderText('Minutes')
        fireEvent.change(minutesInput, { target: { value: '30' } })

        expect(mockOnUpdate).toHaveBeenCalledWith({
            ...timeStep,
            timeMinutes: 30
        })
    })

    test('has correct CSS classes for work step', () => {
        const { container } = render(
            <StepCard
                step={mockStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const stepCard = container.firstChild as HTMLElement
        expect(stepCard.className).toContain('border-wktr-gray-300')
    })

    test('has correct CSS classes for recovery step', () => {
        const recoveryStep: Step = { ...mockStep, purpose: 'recovery' }

        const { container } = render(
            <StepCard
                step={recoveryStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const stepCard = container.firstChild as HTMLElement
        expect(stepCard.className).toContain('border-wktr-gold-300')
        expect(stepCard.className).toContain('bg-wktr-gold-50')
    })
})
