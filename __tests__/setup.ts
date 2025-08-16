import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'

// Clean up after each test
afterEach(() => {
    // Clean up React Testing Library
    cleanup()

    // Clear all mocks
    vi.clearAllMocks()

    // Ensure DOM is completely clean
    if (typeof document !== 'undefined') {
        document.body.innerHTML = ''
        document.head.innerHTML = ''

        // Remove all event listeners
        const newBody = document.createElement('body')
        const newHead = document.createElement('head')
        document.documentElement.replaceChild(newBody, document.body)
        document.documentElement.replaceChild(newHead, document.head)
    }
})

// Configure test environment
beforeEach(() => {
    // Reset any global state
    vi.resetModules()
})
