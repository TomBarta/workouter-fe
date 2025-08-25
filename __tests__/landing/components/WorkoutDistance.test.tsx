import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { WorkoutDistance } from '@/app/landing/components/WorkoutDistance'

describe('WorkoutDistance', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders with default props', () => {
    render(<WorkoutDistance onChange={mockOnChange} />)
    
    expect(screen.getByPlaceholderText(/enter distance/i)).toBeDefined()
    expect(screen.getByDisplayValue('m')).toBeDefined()
  })

  it('renders with initial values', () => {
    render(
      <WorkoutDistance 
        distanceValue={5.5}
        distanceUnit="km"
        onChange={mockOnChange} 
      />
    )
    
    expect(screen.getByDisplayValue('5.5')).toBeDefined()
    expect(screen.getByDisplayValue('km')).toBeDefined()
  })

  it('calls onChange when distance value changes', () => {
    render(<WorkoutDistance onChange={mockOnChange} />)
    
    const input = screen.getByPlaceholderText(/enter distance/i)
    fireEvent.change(input, { target: { value: '10.5' } })
    
    expect(mockOnChange).toHaveBeenCalledWith({
      distanceValue: 10.5,
      distanceUnit: 'm'
    })
  })

  it('calls onChange when unit changes', () => {
    render(<WorkoutDistance distanceValue={5} onChange={mockOnChange} />)
    
    const select = screen.getByDisplayValue('m')
    fireEvent.change(select, { target: { value: 'km' } })
    
    expect(mockOnChange).toHaveBeenCalledWith({
      distanceValue: 5,
      distanceUnit: 'km'
    })
  })

  it('handles empty distance value', () => {
    render(<WorkoutDistance distanceValue={5} onChange={mockOnChange} />)
    
    const input = screen.getByDisplayValue('5')
    fireEvent.change(input, { target: { value: '' } })
    
    expect(mockOnChange).toHaveBeenCalledWith({
      distanceValue: undefined,
      distanceUnit: 'm'
    })
  })

  it('renders all distance unit options', () => {
    render(<WorkoutDistance onChange={mockOnChange} />)
    
    expect(screen.getByText('yd')).toBeDefined()
    expect(screen.getByText('mi')).toBeDefined()
    expect(screen.getByText('m')).toBeDefined()
    expect(screen.getByText('km')).toBeDefined()
  })

  it('accepts decimal values', () => {
    render(<WorkoutDistance onChange={mockOnChange} />)
    
    const input = screen.getByPlaceholderText(/enter distance/i)
    fireEvent.change(input, { target: { value: '3.14' } })
    
    expect(mockOnChange).toHaveBeenCalledWith({
      distanceValue: 3.14,
      distanceUnit: 'm'
    })
  })

  it('has proper input attributes', () => {
    render(<WorkoutDistance onChange={mockOnChange} />)
    
    const input = screen.getByPlaceholderText(/enter distance/i)
    expect(input.getAttribute('type')).toBe('number')
    expect(input.getAttribute('step')).toBe('0.1')
    expect(input.getAttribute('min')).toBe('0')
  })
})