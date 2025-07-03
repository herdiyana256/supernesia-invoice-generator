"use client"

import { useEffect, useState } from "react"

interface ToastProps {
  message: string
  type: "success" | "error" | "info" | "loading"
  duration?: number
  onClose?: () => void
}

export function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (type !== "loading") {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose, type])

  if (!isVisible) return null

  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    loading: "bg-blue-500",
  }[type]

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-in`}>
      <div className="flex items-center gap-2">
        {type === "loading" && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
        <span>{message}</span>
      </div>
    </div>
  )
}
