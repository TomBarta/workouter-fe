import { createWorkout } from '@/app/lib/actions'
import { vi, describe, test, expect, beforeEach } from 'vitest'

// Mock the fetch function
vi.stubGlobal('fetch', vi.fn())

describe('createWorkout', () => {
  let mockFormData: FormData
  
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks()
    
    // Create a new FormData object for each test
    mockFormData = new FormData()
    mockFormData.append('displayName', 'Test Workout')
    mockFormData.append('activity', 'running')
    mockFormData.append('location', 'indoor')
    mockFormData.append('goalSelectMenu', 'distance')
  })
  
  test('should handle JSON response', async () => {
    // Mock fetch to return a JSON response
    const mockResponse = {
      ok: true,
      headers: {
        get: vi.fn().mockReturnValue('application/json')
      },
      json: vi.fn().mockResolvedValue({ id: '123', success: true })
    }
    
    global.fetch = vi.fn().mockResolvedValue(mockResponse)
    
    const result = await createWorkout(mockFormData)
    
    // Check that fetch was called with the right arguments
    expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:8080/workout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: expect.any(String)
    })
    
    // Check that the response was processed correctly
    expect(result).toEqual({ id: '123', success: true })
  })
  
  test('should handle binary response', async () => {
    // Create a mock blob
    const mockBlob = new Blob(['test data'], { type: 'application/octet-stream' })
    
    // Mock fetch to return a binary response
    const mockResponse = {
      ok: true,
      headers: {
        get: vi.fn().mockReturnValue('application/octet-stream')
      },
      blob: vi.fn().mockResolvedValue(mockBlob)
    }
    
    global.fetch = vi.fn().mockResolvedValue(mockResponse)
    
    const result = await createWorkout(mockFormData)
    
    // Check that the response was processed correctly
    expect(result).toEqual({ success: true, blob: mockBlob })
  })
  
  test('should handle text response', async () => {
    // Mock fetch to return a text response
    const mockResponse = {
      ok: true,
      headers: {
        get: vi.fn().mockReturnValue('text/plain')
      },
      text: vi.fn().mockResolvedValue('Success message')
    }
    
    global.fetch = vi.fn().mockResolvedValue(mockResponse)
    
    const result = await createWorkout(mockFormData)
    
    // Check that the response was processed correctly
    expect(result).toEqual({ success: true, data: 'Success message' })
  })
  
  test('should handle error response', async () => {
    // Mock fetch to return an error response
    const mockResponse = {
      ok: false,
      headers: {
        get: vi.fn().mockReturnValue('text/plain')
      },
      text: vi.fn().mockResolvedValue('Error message')
    }
    
    global.fetch = vi.fn().mockResolvedValue(mockResponse)
    
    const result = await createWorkout(mockFormData)
    
    // Check that the response was processed correctly
    expect(result).toEqual({ success: false, data: 'Error message' })
  })
})
