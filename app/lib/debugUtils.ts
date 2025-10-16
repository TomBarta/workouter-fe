import fs from 'fs'
import path from 'path'

/**
 * Saves a payload as JSON file for debugging purposes (development only)
 */
export function saveDebugPayload(payload: any, prefix: string = 'payload'): void {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const debugDir = path.join(process.cwd(), 'debug-payloads')

    // Create debug directory if it doesn't exist
    if (!fs.existsSync(debugDir)) {
      fs.mkdirSync(debugDir, { recursive: true })
    }

    const filename = `${prefix}-${timestamp}.json`
    const filepath = path.join(debugDir, filename)
    fs.writeFileSync(filepath, JSON.stringify(payload, null, 2))
    console.log(`Debug payload saved to: ${filepath}`)
  } catch (error) {
    console.error('Failed to save debug payload:', error)
  }
}
