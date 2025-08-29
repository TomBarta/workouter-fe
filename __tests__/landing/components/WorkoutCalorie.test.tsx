import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { WorkoutCalorie } from '@/app/landing/components/WorkoutCalorie'

describe('WorkoutCalorie', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders with default props', () => {
    render(<WorkoutCalorie onChange={mockOnChange} />)
    
    expect(screen.getByPlaceholderText(/calories/i)).toBeDefined()
    expect(screen.getByDisplayValue('cal')).toBeDefined()
  })

  it('renders with initial values', () => {
    render(
      <WorkoutCalorie 
        calorieValue={500}
        calorieUnit="kilocalories"
        onChange={mockOnChange} 
      />
    )
    
    expect(screen.getByDisplayValue('500')).toBeDefined()
    // Check that the select has the correct value by looking at the actual select element
    const select = screen.getByRole('combobox')
    expect(select.value).toBe('kilocalories')
  })

  it('calls onChange when calorie value changes', () => {
    render(<WorkoutCalorie onChange={mockOnChange} />)
    
    const input = screen.getByPlaceholderText(/calories/i)
    fireEvent.change(input, { target: { value: '300' } })
    
    expect(mockOnChange).toHaveBeenCalledWith({
      calorieValue: 300,
      calorieUnit: 'calories'
    })
  })

  it('calls onChange when unit changes', () => {
    render(<WorkoutCalorie calorieValue={400} onChange={mockOnChange} />)
    
    const select = screen.getByDisplayValue('cal')
    fireEvent.change(select, { target: { value: 'kilocalories' } })
    
    expect(mockOnChange).toHaveBeenCalledWith({
      calorieValue: 400,
      calorieUnit: 'kilocalories'
    })
  })

  it('handles empty calorie value', () => {
    render(<WorkoutCalorie calorieValue={250} onChange={mockOnChange} />)
    
    const input = screen.getByDisplayValue('250')
    fireEvent.change(input, { target: { value: '' } })
    
    expect(mockOnChange).toHaveBeenCalledWith({
      calorieValue: undefined,
      calorieUnit: 'calories'
    })
  })

  it('renders all calorie unit options', () => {
    render(<WorkoutCalorie onChange={mockOnChange} />)
    
    expect(screen.getByText('cal')).toBeDefined()
    expect(screen.getByText('kcal')).toBeDefined()
  })

  it('accepts whole number values', () => {
    render(<WorkoutCalorie onChange={mockOnChange} />)
    
    const input = screen.getByPlaceholderText(/calories/i)
    fireEvent.change(input, { target: { value: '150' } })
    
    expect(mockOnChange).toHaveBeenCalledWith({
      calorieValue: 150,
      calorieUnit: 'calories'
    })
  })

  it('accepts decimal values', () => {
    render(<WorkoutCalorie onChange={mockOnChange} />)
    
    const input = screen.getByPlaceholderText(/calories/i)
    fireEvent.change(input, { target: { value: '250.5' } })
    
    expect(mockOnChange).toHaveBeenCalledWith({
      calorieValue: 250.5,
      calorieUnit: 'calories'
    })
  })

  it('has proper input attributes', () => {
    render(<WorkoutCalorie onChange={mockOnChange} />)
    
    const input = screen.getByPlaceholderText(/calories/i)
    expect(input.getAttribute('type')).toBe('number')
    expect(input.getAttribute('inputmode')).toBe('numeric')
    expect(input.getAttribute('pattern')).toBe('[0-9]*')
    expect(input.getAttribute('step')).toBe('1')
    expect(input.getAttribute('min')).toBe('0')
  })
})