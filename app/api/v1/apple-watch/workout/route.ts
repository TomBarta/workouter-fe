import { NextRequest, NextResponse } from 'next/server'
import { cleanUpPayload, Payload, setGoal, setWorkoutType } from '@/app/lib/pageActionUtils'
import { saveDebugPayload } from '@/app/lib/debugUtils'
import { prisma } from '@/app/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    let payload = await request.json() as Payload
    const goalSelectMenu = payload.goalSelectMenu

    // Set workout type
    payload.workoutType = setWorkoutType(goalSelectMenu)

    // Set workout goal
    payload.goal = setGoal(payload)
    console.log('payload before cleaning: ', payload)

    payload = cleanUpPayload(payload)
    console.log('payload after cleaning: ', payload)

    // Save file locally for debugging
    if (process.env.NODE_ENV === 'development') {
      saveDebugPayload(payload, 'workout-payload')
    }

    // Save to database after cleaning payload
    try {
      const savedWorkout = await prisma.workout.create({
        data: {
          displayName: payload.displayName || 'Untitled Workout',
          workoutJson: payload,
          visibility: 'private',
          userId: null, // Will be set when auth is implemented
          schemaVersion: 1,
        },
      })
      console.log('Workout saved to database with ID:', savedWorkout.id)
    } catch (dbError) {
      console.error('Failed to save workout to database:', dbError)
      // Don't fail the request if database save fails, just log it
    }

    // Forward to external API
    const response = await fetch(`http://127.0.0.1:8080/workout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'your-secret-api-key'
      },
      body: JSON.stringify(payload),
    })

    const contentType = response.headers.get('Content-Type')

    if (contentType && contentType.includes('application/json')) {
      const result = await response.json()
      return NextResponse.json(result)
    } else if (contentType && contentType.includes('application/octet-stream')) {
      // Handle binary file response
      const blob = await response.blob()
      return new NextResponse(blob, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${payload.displayName}.workout"`
        }
      })
    } else {
      // Handle other response types or fallback
      const text = await response.text()
      return NextResponse.json(
        { success: response.ok, data: text },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error('Error creating workout:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create workout' },
      { status: 500 }
    )
  }
}