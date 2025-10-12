import type { NextRequest } from "next/server"

const clients = new Set<ReadableStreamDefaultController<string>>()
let lastContent = ""
let heartbeatInterval: NodeJS.Timeout | null = null

// Start heartbeat to keep connections alive and clean up inactive ones
const startHeartbeat = () => {
  if (heartbeatInterval) return
  
  heartbeatInterval = setInterval(() => {
    const cleanedCount = cleanupInactiveClients()
    if (cleanedCount > 0) {
      console.log(`Heartbeat: Cleaned up ${cleanedCount} inactive clients`)
    }
    
    // Send heartbeat to active clients
    const activeClients = Array.from(clients).filter(isControllerActive)
    activeClients.forEach(client => {
      try {
        client.enqueue(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`)
      } catch (error) {
        console.error('Heartbeat error:', error)
        clients.delete(client)
      }
    })
  }, 30000) // Every 30 seconds
}

// Stop heartbeat when no clients
const stopHeartbeat = () => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval)
    heartbeatInterval = null
  }
}

// Helper function to check if a controller is still active
const isControllerActive = (controller: ReadableStreamDefaultController<string>): boolean => {
  try {
    // Check if the controller is still writable by checking desiredSize
    return controller.desiredSize !== null
  } catch {
    return false
  }
}

// Helper function to clean up inactive controllers
const cleanupInactiveClients = () => {
  const inactiveClients: ReadableStreamDefaultController<string>[] = []
  
  clients.forEach(client => {
    if (!isControllerActive(client)) {
      inactiveClients.push(client)
    }
  })
  
  inactiveClients.forEach(client => {
    clients.delete(client)
  })
  
  return inactiveClients.length
}

export async function GET() {
  let currentController: ReadableStreamDefaultController<string> | null = null
  
  const stream = new ReadableStream({
    start(controller) {
      currentController = controller
      clients.add(controller)
      
      // Start heartbeat if this is the first client
      if (clients.size === 1) {
        startHeartbeat()
      }
      
      // Send initial content if available
      if (lastContent) {
        try {
          controller.enqueue(`data: ${JSON.stringify({ content: lastContent })}\n\n`)
        } catch (error) {
          console.error('Error sending initial content:', error)
          clients.delete(controller)
        }
      }
    },
    cancel() {
      // Remove this specific controller from the set
      if (currentController) {
        clients.delete(currentController)
        currentController = null
      }
      
      // Stop heartbeat if no clients left
      if (clients.size === 0) {
        stopHeartbeat()
      }
      
      // Clean up any other inactive controllers
      cleanupInactiveClients()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}

export async function POST(request: NextRequest) {
  const { content } = await request.json()
  lastContent = content
  
  // Clean up inactive clients first
  const cleanedCount = cleanupInactiveClients()
  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} inactive clients`)
  }
  
  // Send content to all active clients
  const activeClients = Array.from(clients).filter(isControllerActive)
  let successCount = 0
  let errorCount = 0
  
  activeClients.forEach((client) => {
    try {
      client.enqueue(`data: ${JSON.stringify({ content })}\n\n`)
      successCount++
    } catch (error) {
      console.error('Error sending content to client:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        code: error instanceof Error && 'code' in error ? (error as Error & { code: string }).code : 'UNKNOWN'
      })
      clients.delete(client)
      errorCount++
    }
  })
  
  console.log(`Content sent to ${successCount} clients, ${errorCount} errors`)
  
  return new Response("OK")
}

