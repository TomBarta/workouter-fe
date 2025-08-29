import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { WorkoutTime } from '@/app/landing/components/WorkoutTime'

describe('WorkoutTime', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders with default props', () => {
    render(<WorkoutTime onChange={mockOnChange} />)
    
    expect(screen.getByPlaceholderText(/hr/i)).toBeDefined()
    expect(screen.getByPlaceholderText(/min/i)).toBeDefined()
    expect(screen.getByPlaceholderText(/sec/i)).toBeDefined()
  })

  it('renders with initial values', () => {
    render(
      <WorkoutTime 
        timeHours={2}
        timeMinutes={30}
        timeSeconds={45}
        onChange={mockOnChange} 
      />
    )
    
    expect(screen.getByDisplayValue('2')).toBeDefined()
    expect(screen.getByDisplayValue('30')).toBeDefined()
    expect(screen.getByDisplayValue('45')).toBeDefined()
  })

  it('calls onChange when hours value changes', () => {
    render(<WorkoutTime onChange={mockOnChange} />)
    
    const hoursInput = screen.getByPlaceholderText(/hr/i)
    fireEvent.change(hoursInput, { target: { value: '1' } })
    
    expect(mockOnChange).toHaveBeenCalledWith({
      timeHours: 1,
      timeMinutes: undefined,
      timeSeconds: undefined
    })
  })

  it('calls onChange when minutes value changes', () => {
    render(<WorkoutTime timeHours={1} onChange={mockOnChange} />)
    
    const minutesInput = screen.getByPlaceholderText(/min/i)
    fireEvent.change(minutesInput, { target: { value: '30' } })
    
    expect(mockOnChange).toHaveBeenCalledWith({
      timeHours: 1,
      timeMinutes: 30,
      timeSeconds: undefined
    })
  })

  it('calls onChange when seconds value changes', () => {
    render(<WorkoutTime timeHours={1} timeMinutes={30} onChange={mockOnChange} />)
    
    const secondsInput = screen.getByPlaceholderText(/sec/i)
    fireEvent.change(secondsInput, { target: { value: '45' } })
    
    expect(mockOnChange).toHaveBeenCalledWith({
      timeHours: 1,
      timeMinutes: 30,
      timeSeconds: 45
    })
  })

  it('handles empty time values', () => {
    render(<WorkoutTime timeHours={1} timeMinutes={30} timeSeconds={45} onChange={mockOnChange} />)
    
    const hoursInput = screen.getByDisplayValue('1')
    fireEvent.change(hoursInput, { target: { value: '' } })
    
    expect(mockOnChange).toHaveBeenCalledWith({
      timeHours: undefined,
      timeMinutes: 30,
      timeSeconds: 45
    })
  })

  it('has proper input attributes', () => {
    render(<WorkoutTime onChange={mockOnChange} />)
    
    const hoursInput = screen.getByPlaceholderText(/hr/i)
    const minutesInput = screen.getByPlaceholderText(/min/i)
    const secondsInput = screen.getByPlaceholderText(/sec/i)
    
    expect(hoursInput.getAttribute('type')).toBe('number')
    expect(hoursInput.getAttribute('inputmode')).toBe('numeric')
    expect(hoursInput.getAttribute('pattern')).toBe('[0-9]*')
    expect(hoursInput.getAttribute('step')).toBe('1')
    expect(hoursInput.getAttribute('min')).toBe('0')
    expect(hoursInput.getAttribute('max')).toBe('23')
    
    expect(minutesInput.getAttribute('type')).toBe('number')
    expect(minutesInput.getAttribute('inputmode')).toBe('numeric')
    expect(minutesInput.getAttribute('pattern')).toBe('[0-9]*')
    expect(minutesInput.getAttribute('step')).toBe('1')
    expect(minutesInput.getAttribute('min')).toBe('0')
    expect(minutesInput.getAttribute('max')).toBe('59')
    
    expect(secondsInput.getAttribute('type')).toBe('number')
    expect(secondsInput.getAttribute('inputmode')).toBe('numeric')
    expect(secondsInput.getAttribute('pattern')).toBe('[0-9]*')
    expect(secondsInput.getAttribute('step')).toBe('1')
    expect(secondsInput.getAttribute('min')).toBe('0')
    expect(secondsInput.getAttribute('max')).toBe('59')
  })

  it('accepts integer values only', () => {
    render(<WorkoutTime onChange={mockOnChange} />)
    
    const hoursInput = screen.getByPlaceholderText(/hr/i)
    fireEvent.change(hoursInput, { target: { value: '2' } })
    
    expect(mockOnChange).toHaveBeenCalledWith({
      timeHours: 2,
      timeMinutes: undefined,
      timeSeconds: undefined
    })
  })
})