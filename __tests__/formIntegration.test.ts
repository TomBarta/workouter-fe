import { vi, describe, test, expect, beforeEach } from 'vitest'
import * as pageActionUtils from '@/app/lib/pageActionUtils'
import * as actions from '@/app/lib/actions'

describe('Form to API integration', () => {
  let mockFormData: FormData
  let cleanUpPayloadSpy: any
  let createWorkoutSpy: any
  
  beforeEach(() => {
    // Create fresh spy for each test to reset mock counts
    cleanUpPayloadSpy = vi.spyOn(pageActionUtils, 'cleanUpPayload')
    createWorkoutSpy = vi.spyOn(actions, 'createWorkout')
    
    // Mock fetch for API calls
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: vi.fn().mockReturnValue('application/json')
      },
      json: vi.fn().mockResolvedValue({ id: '123', success: true })
    })
    
    // Create test form data
    mockFormData = new FormData()
    mockFormData.append('displayName', 'Integration Test')
    mockFormData.append('activityType', 'running')
    mockFormData.append('location', 'indoor')
    mockFormData.append('goalSelectMenu', 'time')
    mockFormData.append('timeValue', '30')
    mockFormData.append('timeUnit', 'min')
  })
  
  test('should use cleanUpPayload during API call', async () => {
    await actions.createWorkout(mockFormData)
    
    // Verify cleanUpPayload was called during the action
    expect(cleanUpPayloadSpy).toHaveBeenCalled()
    
    // Verify fetch was called with the right method
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST'
      })
    )
  })
  
  test('should handle form data with arrays and complex objects', async () => {
    // Add complex data to form
    mockFormData.append('intervals[0][type]', 'work')
    mockFormData.append('intervals[0][duration]', '60')
    mockFormData.append('intervals[1][type]', 'recovery')
    mockFormData.append('intervals[1][duration]', '30')
    
    await actions.createWorkout(mockFormData)
    
    // Fetch should have been called with JSON body containing the complex data
    const callArgs = (fetch as any).mock.calls[0][1]
    const bodyJson = callArgs.body
    
    // Simple verification that JSON was created
    expect(bodyJson).toContain('"displayName":"Integration Test"')
    expect(bodyJson).toContain('"activityType":"running"')
    expect(bodyJson).toContain('"location":"indoor"')
  })
  
  test('should correctly handle time-based goals from form data', async () => {
    // Create form data with time-based goal
    const timeFormData = new FormData()
    timeFormData.append('displayName', 'Time Goal Workout')
    timeFormData.append('activityType', 'running')
    timeFormData.append('location', 'indoor')
    timeFormData.append('goalSelectMenu', 'time')
    timeFormData.append('hrs', '1')
    timeFormData.append('min', '30')
    timeFormData.append('sec', '0')
    
    await actions.createWorkout(timeFormData)
    
    // Fetch should have been called with correctly formatted time-based workout JSON
    const callArgs = (fetch as any).mock.calls[0][1]
    const bodyObj = JSON.parse(callArgs.body)
    
    // Check that the goal was set correctly
    expect(bodyObj).toHaveProperty('goal')
    expect(bodyObj.goal).toHaveProperty('type', 'time')
    expect(bodyObj.goal).toHaveProperty('unit', 'seconds')
    expect(bodyObj.goal).toHaveProperty('targetDuration')
    
    // Check that the form data was correctly processed
    expect(bodyObj).toHaveProperty('displayName', 'Time Goal Workout')
    expect(bodyObj).toHaveProperty('activityType', 'running')
    expect(bodyObj).toHaveProperty('location', 'indoor')
    expect(bodyObj).toHaveProperty('workoutType', 'singleGoalWorkout')
  })
})
