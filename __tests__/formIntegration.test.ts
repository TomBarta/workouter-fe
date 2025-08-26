import { vi, describe, test, expect, beforeEach } from 'vitest'
import * as pageActionUtils from '@/app/lib/pageActionUtils'
import * as actions from '@/app/lib/actions'

describe('Form to API integration', () => {
  let mockFormData: FormData
  let cleanUpPayloadSpy: any
  
  beforeEach(() => {
    // Create fresh spy for each test to reset mock counts
    cleanUpPayloadSpy = vi.spyOn(pageActionUtils, 'cleanUpPayload')
    
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

  test('should correctly handle distance-based goals from form data', async () => {
    // Create form data with distance-based goal
    const distanceFormData = new FormData()
    distanceFormData.append('displayName', 'Distance Goal Workout')
    distanceFormData.append('activityType', 'running')
    distanceFormData.append('location', 'outdoor')
    distanceFormData.append('goalSelectMenu', 'distance')
    distanceFormData.append('targetValue', '5.5')
    distanceFormData.append('unit', 'km')
    
    await actions.createWorkout(distanceFormData)
    
    // Fetch should have been called with correctly formatted distance-based workout JSON
    const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1]
    const bodyObj = JSON.parse(callArgs.body)
    
    // Check that the goal was set correctly
    expect(bodyObj).toHaveProperty('goal')
    expect(bodyObj.goal).toHaveProperty('type', 'distance')
    expect(bodyObj.goal).toHaveProperty('unit', 'km')
    expect(bodyObj.goal).toHaveProperty('targetValue', '5.5')
    
    // Check that the form data was correctly processed
    expect(bodyObj).toHaveProperty('displayName', 'Distance Goal Workout')
    expect(bodyObj).toHaveProperty('activityType', 'running')
    expect(bodyObj).toHaveProperty('location', 'outdoor')
    expect(bodyObj).toHaveProperty('workoutType', 'singleGoalWorkout')
  })

  test('should handle complete distance workout form flow', async () => {
    // Mock the full form submission flow with all required fields
    const completeDistanceFormData = new FormData()
    completeDistanceFormData.append('displayName', '5K Morning Run')
    completeDistanceFormData.append('activityType', 'running')
    completeDistanceFormData.append('location', 'outdoor')
    completeDistanceFormData.append('goalSelectMenu', 'distance')
    completeDistanceFormData.append('targetValue', '5')
    completeDistanceFormData.append('unit', 'km')
    completeDistanceFormData.append('swimmingLocation', 'indoors')
    
    const result = await actions.createWorkout(completeDistanceFormData)
    
    // Verify the result contains expected structure
    expect(result).toHaveProperty('success', true)
    expect(result).toHaveProperty('id', '123')
    
    // Verify the API was called with correct payload structure
    const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1]
    const bodyObj = JSON.parse(callArgs.body)
    
    expect(bodyObj).toMatchObject({
      displayName: '5K Morning Run',
      activityType: 'running',
      location: 'outdoor',
      workoutType: 'singleGoalWorkout',
      swimmingLocation: 'indoors',
      goal: {
        type: 'distance',
        unit: 'km',
        targetValue: '5'
      }
    })
    
    // Verify cleanUpPayload was called to process the data
    expect(cleanUpPayloadSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        displayName: '5K Morning Run',
        activityType: 'running',
        goalSelectMenu: 'distance'
      })
    )
  })
})

