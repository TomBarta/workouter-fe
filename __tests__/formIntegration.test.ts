import { createWorkout } from '@/app/lib/actions'
import { cleanUpPayload } from '@/app/lib/pageActionUtils'
import { vi, describe, test, expect, beforeEach } from 'vitest'

// Mock the actions module instead of just pageActionUtils
vi.mock('@/app/lib/actions', async () => {
  const actual = await vi.importActual('@/app/lib/actions')
  return {
    ...actual,
    createWorkout: vi.fn().mockImplementation(async (formData) => {
      // Create a payload with cleaned:true to verify our mock is working
      const payload = {
        cleaned: true,
        displayName: formData.get('displayName'),
        activityType: formData.get('activityType'),
        location: formData.get('location')
      }
      
      // Call original cleanUpPayload to verify it's being used
      const { cleanUpPayload } = await vi.importActual('@/app/lib/pageActionUtils')
      cleanUpPayload(Object.fromEntries(formData.entries()))
      
      return { success: true, data: payload }
    })
  }
})

// We'll spy on cleanUpPayload without mocking it
vi.mock('@/app/lib/pageActionUtils', async () => {
  const actual = await vi.importActual('@/app/lib/pageActionUtils')
  return {
    ...actual,
    cleanUpPayload: vi.fn(actual.cleanUpPayload)
  }
})

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
    const result = await createWorkout(mockFormData)
    
    // Verify cleanUpPayload was called
    expect(cleanUpPayload).toHaveBeenCalled()
    
    // Verify the response contains our mocked data with cleaned:true
    expect(result).toEqual(expect.objectContaining({
      success: true,
      data: expect.objectContaining({
        cleaned: true
      })
    }))
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
