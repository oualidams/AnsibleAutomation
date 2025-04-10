"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"

// Mock data for when WebSocket is not available
import { mockServerMetrics, mockServerStatus, mockRecentActivity } from "@/lib/mock-data"

type WebSocketContextType = {
  socket: WebSocket | null
  isConnected: boolean
  sendMessage: (message: any) => void
  lastMessage: any
  connect: () => void
  disconnect: () => void
  mockMode: boolean
  getMockData: (topic: string) => any
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

export const WebSocketProvider = ({
  children,
  url = "ws://localhost:8000/ws",
}: {
  children: React.ReactNode
  url?: string
}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<any>(null)
  const [mockMode, setMockMode] = useState(false)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 3
  const { toast } = useToast()

  // Function to get mock data for a specific topic
  const getMockData = useCallback((topic: string) => {
    switch (topic) {
      case "server-metrics":
        return mockServerMetrics
      case "server-status":
        return mockServerStatus
      case "recent-activity":
        return mockRecentActivity
      default:
        if (topic.startsWith("execution-")) {
          // Mock execution data
          const executionId = topic.split("-")[1]
          return {
            id: executionId,
            playbook: "Mock Playbook",
            status: "running",
            progress: 50,
            startTime: new Date().toISOString(),
            duration: "1m 30s",
            servers: [
              {
                name: "web-server-01",
                status: "running",
                tasks: { total: 5, completed: 3, failed: 0 },
              },
              {
                name: "web-server-02",
                status: "success",
                tasks: { total: 5, completed: 5, failed: 0 },
              },
            ],
          }
        }
        return null
    }
  }, [])

  const connect = useCallback(() => {
    if (socket !== null || mockMode) return

    try {
      const ws = new WebSocket(url)

      ws.onopen = () => {
        setIsConnected(true)
        reconnectAttemptsRef.current = 0
        toast({
          title: "Connected to server",
          description: "Real-time updates are now active",
        })
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setLastMessage(data)
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error)
        }
      }

      ws.onclose = () => {
        setIsConnected(false)
        setSocket(null)

        // Attempt to reconnect if we haven't exceeded max attempts
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1
          reconnectTimeoutRef.current = setTimeout(() => {
            toast({
              title: "Connection lost",
              description: `Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`,
              variant: "destructive",
            })
            connect()
          }, 5000)
        } else {
          // Switch to mock mode after max reconnect attempts
          setMockMode(true)
          toast({
            title: "Using offline mode",
            description: "Could not connect to server. Using simulated data.",
          })
        }
      }

      ws.onerror = (event) => {
        // The error event doesn't contain useful information, just log that an error occurred
        console.error("WebSocket connection error occurred")

        // Don't call ws.close() here as the connection will automatically close on error
        // and trigger the onclose handler

        // Switch to mock mode immediately for better UX
        setMockMode(true)
        toast({
          title: "Using offline mode",
          description: "Could not connect to server. Using simulated data.",
        })
      }

      setSocket(ws)
    } catch (error) {
      console.error("Failed to create WebSocket:", error)
      setMockMode(true)
      toast({
        title: "Using offline mode",
        description: "Could not connect to server. Using simulated data.",
      })
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [url, socket, toast, mockMode])

  const disconnect = useCallback(() => {
    if (socket) {
      socket.close()
      setSocket(null)
      setIsConnected(false)
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
  }, [socket])

  const sendMessage = useCallback(
    (message: any) => {
      if (socket && isConnected) {
        socket.send(typeof message === "string" ? message : JSON.stringify(message))
      } else if (mockMode) {
        // In mock mode, simulate responses for certain actions
        if (message.action === "subscribe" && message.topic) {
          const mockData = getMockData(message.topic)
          if (mockData) {
            // Simulate a delayed response
            setTimeout(() => {
              setLastMessage({
                topic: message.topic,
                type: "mock_data",
                data: mockData,
              })
            }, 500)
          }
        } else if (message.action === "execute-playbook") {
          // Simulate execution start
          setTimeout(() => {
            const executionId = `mock-${Date.now()}`
            setLastMessage({
              type: "execution-started",
              data: {
                executionId,
                status: "running",
                startTime: new Date().toISOString(),
              },
            })
          }, 1000)
        }
      } else {
        console.warn("Cannot send message, socket is not connected and mock mode is disabled")
      }
    },
    [socket, isConnected, mockMode, getMockData],
  )

  // Auto-connect on component mount
  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        isConnected,
        sendMessage,
        lastMessage,
        connect,
        disconnect,
        mockMode,
        getMockData,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}

export const useWebSocket = () => {
  const context = useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider")
  }
  return context
}

// Custom hook for topic-specific subscriptions
export const useWebSocketTopic = (topic: string) => {
  const { isConnected, sendMessage, lastMessage, mockMode, getMockData } = useWebSocket()
  const [topicData, setTopicData] = useState<any>(null)

  // If in mock mode, immediately return mock data
  useEffect(() => {
    if (mockMode) {
      setTopicData(getMockData(topic))
    }
  }, [mockMode, getMockData, topic])

  // Subscribe to topic when connected
  useEffect(() => {
    if (isConnected) {
      sendMessage({ action: "subscribe", topic })

      // Unsubscribe when unmounting
      return () => {
        sendMessage({ action: "unsubscribe", topic })
      }
    }
  }, [isConnected, sendMessage, topic])

  // Process messages for this topic
  useEffect(() => {
    if (lastMessage && lastMessage.topic === topic) {
      setTopicData(lastMessage.data)
    }
  }, [lastMessage, topic])

  return topicData
}
