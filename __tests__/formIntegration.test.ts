import { createWorkout } from '@/app/lib/actions'
import { cleanUpPayload } from '@/app/lib/pageActionUtils'
import { vi, describe, test, expect, beforeEach } from 'vitest'

// Mock the fetch function and pageActionUtils
vi.mock('@/app/lib/pageActionUtils', async () => {
  const actual = await vi.importActual('@/app/lib/pageActionUtils')
  return {
    ...actual,
    cleanUpPayload: vi.fn().mockImplementation((data) => {
      return { 
        ...data, 
        cleaned: true 
      }
    })
  }
})

vi.stubGlobal('fetch', vi.fn())

describe('Form to API integration', () => {
  let mockFormData: FormData
  
  beforeEach(() => {
    vi.resetAllMocks()
    
    mockFormData = new FormData()
    mockFormData.append('displayName', 'Integration Test')
    mockFormData.append('activityType', 'running')
    mockFormData.append('location', 'indoor')
    mockFormData.append('goalSelectMenu', 'time')
    mockFormData.append('timeValue', '30')
    mockFormData.append('timeUnit', 'min')
  })
  
  test('should use cleanUpPayload before sending to API', async () => {
    // Mock successful response
    const mockResponse = {
      ok: true,
      headers: {
        get: vi.fn().mockReturnValue('application/json')
      },
      json: vi.fn().mockResolvedValue({ id: '123', success: true })
    }
    
    global.fetch = vi.fn().mockResolvedValue(mockResponse)
    
    await createWorkout(mockFormData)
    
    // Verify cleanUpPayload was called
    expect(cleanUpPayload).toHaveBeenCalled()
    
    // Verify fetch was called with cleaned data
    expect(fetch).toHaveBeenCalledWith(expect.any(String), {
      method: 'POST',
      headers: expect.any(Object),
      body: expect.stringContaining('"cleaned":true')
    })
  })
  
  test('should handle form data with arrays and complex objects', async () => {
    // Add complex data to form
    mockFormData.append('intervals[0][type]', 'work')
    mockFormData.append('intervals[0][duration]', '60')
    mockFormData.append('intervals[1][type]', 'recovery')
    mockFormData.append('intervals[1][duration]', '30')
    
    // Mock successful response
    const mockResponse = {
      ok: true,
      headers: {
        get: vi.fn().mockReturnValue('application/json')
      },
      json: vi.fn().mockResolvedValue({ id: '123', success: true })
    }
    
    global.fetch = vi.fn().mockResolvedValue(mockResponse)
    
    await createWorkout(mockFormData)
    
    // Verify cleanUpPayload was called with correctly parsed form data
    const cleanUpPayloadCall = (cleanUpPayload as any).mock.calls[0][0]
    
    // Check that form data was correctly converted to a structured object
    expect(cleanUpPayloadCall).toHaveProperty('displayName', 'Integration Test')
    expect(cleanUpPayloadCall).toHaveProperty('activityType', 'running')
    expect(cleanUpPayloadCall).toHaveProperty('location', 'indoor')
  })
})
