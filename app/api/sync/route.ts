import type { NextRequest } from "next/server"

const clients = new Set<ReadableStreamDefaultController<string>>()
let lastContent = ""

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller)
      controller.enqueue(`data: ${JSON.stringify({ content: lastContent })}\n\n`)
    },
    cancel() {
      // Use Array.from to get a snapshot of the clients to avoid modification during iteration
      Array.from(clients).forEach(client => {
        if (client.desiredSize === null) {
          clients.delete(client)
        }
      })
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
  
  // Create a copy of clients to avoid modification during iteration
  Array.from(clients).forEach((client) => {
    try {
      // Only send to active clients
      if (client.desiredSize !== null) {
        client.enqueue(`data: ${JSON.stringify({ content })}\n\n`)
      } else {
        // Remove closed clients
        clients.delete(client)
      }
    } catch (error) {
      // Remove client if we encounter any errors (like closed connections)
      console.error('Error sending content to client:', {
        error,
        client
      })
      clients.delete(client)
    }
  })
  
  return new Response("OK")
}

