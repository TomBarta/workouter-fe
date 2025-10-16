import { vi, describe, test, expect, beforeEach } from 'vitest'
import { render, fireEvent, within } from '@testing-library/react'
import { StepCard } from '@/app/landing/components/StepCard'
import { Step } from '@/app/landing/components/types'
import { IntervalStepPurpose, WorkoutGoalTypes } from '@/app/utils/workouts'

describe('StepCard', () => {
    const mockStep: Step = {
        id: 'step-1',
        purpose: IntervalStepPurpose.work,
        goalType: WorkoutGoalTypes.open
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
    })

    test('renders recovery step correctly', () => {
        const recoveryStep: Step = { ...mockStep, purpose: IntervalStepPurpose.recovery }
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
            purpose: 'recovery',
            goalType: 'time'
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
        const distanceStep: Step = { ...mockStep, goalType: WorkoutGoalTypes.distance
         }

        const { container } = render(
            <StepCard
                step={distanceStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const stepCard = container.firstChild as HTMLElement
        const distanceInput = within(stepCard).queryByPlaceholderText('Enter distance')
        expect(distanceInput).toBeTruthy()
    })

    test('shows calories inputs when calories goal is selected', () => {
        const caloriesStep: Step = { ...mockStep, goalType: WorkoutGoalTypes.energy }

        const { container } = render(
            <StepCard
                step={caloriesStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const stepCard = container.firstChild as HTMLElement
        const caloriesInput = within(stepCard).queryByPlaceholderText('calories')
        expect(caloriesInput).toBeTruthy()
    })

    test('shows time inputs when time goal is selected', () => {
        const timeStep: Step = { ...mockStep, goalType: WorkoutGoalTypes.time }

        const { container } = render(
            <StepCard
                step={timeStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const stepCard = container.firstChild as HTMLElement
        const minutesInput = within(stepCard).queryByPlaceholderText('min')
        const secondsInput = within(stepCard).queryByPlaceholderText('sec')
        expect(minutesInput).toBeTruthy()
        expect(secondsInput).toBeTruthy()
    })

    test('shows recovery duration inputs for recovery steps', () => {
        const recoveryStep: Step = { ...mockStep, purpose: IntervalStepPurpose.recovery }

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
        const minutesInput = within(stepCard).queryByPlaceholderText('min')
        const secondsInput = within(stepCard).queryByPlaceholderText('sec')
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
        const distanceStep: Step = { ...mockStep, goalType: WorkoutGoalTypes.distance }

        const { container } = render(
            <StepCard
                step={distanceStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const stepCard = container.firstChild as HTMLElement
        const distanceInput = within(stepCard).getByPlaceholderText('Enter distance')
        fireEvent.change(distanceInput, { target: { value: '5.5' } })

        expect(mockOnUpdate).toHaveBeenCalledWith({
            ...distanceStep,
            distanceValue: 5.5,
            distanceUnit: 'm'
        })
    })

    test('calls onUpdate when calories value changes', () => {
        const caloriesStep: Step = { ...mockStep, goalType: WorkoutGoalTypes.energy }

        const { container } = render(
            <StepCard
                step={caloriesStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const stepCard = container.firstChild as HTMLElement
        const caloriesInput = within(stepCard).getByPlaceholderText('calories')
        fireEvent.change(caloriesInput, { target: { value: '500' } })

        expect(mockOnUpdate).toHaveBeenCalledWith({
            ...caloriesStep,
            caloriesValue: 500,
            caloriesUnit: 'calories'
        })
    })

    test('calls onUpdate when time values change', () => {
        const timeStep: Step = { ...mockStep, goalType: WorkoutGoalTypes.time }

        const { container } = render(
            <StepCard
                step={timeStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const stepCard = container.firstChild as HTMLElement
        const minutesInput = within(stepCard).getByPlaceholderText('min')
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
        expect(stepCard.className).toContain('border-wktr-orange-300')
    })

    test('has correct CSS classes for recovery step', () => {
        const recoveryStep: Step = { ...mockStep, purpose: IntervalStepPurpose.recovery }

        const { container } = render(
            <StepCard
                step={recoveryStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const stepCard = container.firstChild as HTMLElement
        expect(stepCard.className).toContain('border-wktr-blue-300')
    })
})
