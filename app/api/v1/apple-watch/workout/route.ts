import { NextRequest, NextResponse } from 'next/server'
import { cleanUpPayload, Payload, setGoal, setWorkoutType } from '@/app/lib/pageActionUtils'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    let payload = Object.fromEntries(formData.entries()) as unknown as Payload
    const goalSelectMenu = formData.get("goalSelectMenu")?.toString()

    // Set workout type
    payload.workoutType = setWorkoutType(goalSelectMenu)

    // Set workout goal
    payload.goal = setGoal(payload)
    console.log('payload before cleaning: ', payload)
    
    payload = cleanUpPayload(payload)
    console.log('payload after cleaning: ', payload)

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