import { vi, describe, test, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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
        render(
            <StepCard
                step={mockStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        expect(screen.getByText('Work')).toBeInTheDocument()
        expect(screen.getByText('Purpose')).toBeInTheDocument()
    })

    test('renders recovery step correctly', () => {
        const recoveryStep: Step = { ...mockStep, purpose: 'recovery' }

        render(
            <StepCard
                step={recoveryStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        expect(screen.getByText('Recovery')).toBeInTheDocument()
    })

    test('shows remove button when canRemove is true', () => {
        render(
            <StepCard
                step={mockStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        expect(screen.getByText('Remove')).toBeInTheDocument()
    })

    test('hides remove button when canRemove is false', () => {
        render(
            <StepCard
                step={mockStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={false}
            />
        )

        expect(screen.queryByText('Remove')).not.toBeInTheDocument()
    })

    test('calls onRemove when remove button is clicked', () => {
        render(
            <StepCard
                step={mockStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const removeButton = screen.getByText('Remove')
        fireEvent.click(removeButton)

        expect(mockOnRemove).toHaveBeenCalledTimes(1)
    })

    test('calls onUpdate when purpose changes', () => {
        render(
            <StepCard
                step={mockStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const recoveryRadio = screen.getByLabelText('Recovery')
        fireEvent.click(recoveryRadio)

        expect(mockOnUpdate).toHaveBeenCalledWith({
            ...mockStep,
            purpose: 'recovery'
        })
    })

    test('shows goal type selector for work steps', () => {
        render(
            <StepCard
                step={mockStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        expect(screen.getByText('Goal Type')).toBeInTheDocument()
        expect(screen.getByText('Select goal...')).toBeInTheDocument()
    })

    test('shows distance inputs when distance goal is selected', () => {
        const distanceStep: Step = { ...mockStep, goalType: 'distance' }

        render(
            <StepCard
                step={distanceStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        expect(screen.getByPlaceholderText('Distance')).toBeInTheDocument()
        expect(screen.getByText('Unit')).toBeInTheDocument()
    })

    test('shows calories inputs when calories goal is selected', () => {
        const caloriesStep: Step = { ...mockStep, goalType: 'calories' }

        render(
            <StepCard
                step={caloriesStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        expect(screen.getByPlaceholderText('Calories')).toBeInTheDocument()
        expect(screen.getByText('Unit')).toBeInTheDocument()
    })

    test('shows time inputs when time goal is selected', () => {
        const timeStep: Step = { ...mockStep, goalType: 'time' }

        render(
            <StepCard
                step={timeStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        expect(screen.getByPlaceholderText('Hours')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Minutes')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Seconds')).toBeInTheDocument()
    })

    test('shows recovery duration inputs for recovery steps', () => {
        const recoveryStep: Step = { ...mockStep, purpose: 'recovery' }

        render(
            <StepCard
                step={recoveryStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        expect(screen.getByText('Recovery Duration')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Minutes')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Seconds')).toBeInTheDocument()
    })

    test('calls onUpdate when goal type changes', () => {
        render(
            <StepCard
                step={mockStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const goalSelect = screen.getByText('Select goal...').closest('select')
        fireEvent.change(goalSelect!, { target: { value: 'distance' } })

        expect(mockOnUpdate).toHaveBeenCalledWith({
            ...mockStep,
            goalType: 'distance'
        })
    })

    test('calls onUpdate when distance value changes', () => {
        const distanceStep: Step = { ...mockStep, goalType: 'distance' }

        render(
            <StepCard
                step={distanceStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const distanceInput = screen.getByPlaceholderText('Distance')
        fireEvent.change(distanceInput, { target: { value: '5.5' } })

        expect(mockOnUpdate).toHaveBeenCalledWith({
            ...distanceStep,
            distanceValue: 5.5
        })
    })

    test('calls onUpdate when calories value changes', () => {
        const caloriesStep: Step = { ...mockStep, goalType: 'calories' }

        render(
            <StepCard
                step={caloriesStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const caloriesInput = screen.getByPlaceholderText('Calories')
        fireEvent.change(caloriesInput, { target: { value: '500' } })

        expect(mockOnUpdate).toHaveBeenCalledWith({
            ...caloriesStep,
            caloriesValue: 500
        })
    })

    test('calls onUpdate when time values change', () => {
        const timeStep: Step = { ...mockStep, goalType: 'time' }

        render(
            <StepCard
                step={timeStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const minutesInput = screen.getByPlaceholderText('Minutes')
        fireEvent.change(minutesInput, { target: { value: '30' } })

        expect(mockOnUpdate).toHaveBeenCalledWith({
            ...timeStep,
            timeMinutes: 30
        })
    })

    test('has correct CSS classes for work step', () => {
        render(
            <StepCard
                step={mockStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const card = screen.getByText('Work').closest('.card')
        expect(card).toHaveClass('border-gray-300')
    })

    test('has correct CSS classes for recovery step', () => {
        const recoveryStep: Step = { ...mockStep, purpose: 'recovery' }

        render(
            <StepCard
                step={recoveryStep}
                onUpdate={mockOnUpdate}
                onRemove={mockOnRemove}
                canRemove={true}
            />
        )

        const card = screen.getByText('Recovery').closest('.card')
        expect(card).toHaveClass('border-blue-300', 'bg-blue-50')
    })
})
