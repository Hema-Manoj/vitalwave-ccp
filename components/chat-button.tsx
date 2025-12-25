"use client"

import { useState, useEffect } from "react"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ref, onValue } from "firebase/database"
import { database } from "@/lib/firebase"

interface ChatButtonProps {
  userId: string
  userRole: "ambulance" | "hospital"
  onClick: () => void
}

export function ChatButton({ userId, userRole, onClick }: ChatButtonProps) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const messagesRef = ref(database, "messages")
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const messages = Object.values(snapshot.val()) as any[]
        const unreadMessages = messages.filter(
          (msg) => msg.receiverId === userId && msg.senderRole !== userRole && !msg.read,
        )
        setUnreadCount(unreadMessages.length)
      }
    })

    return () => unsubscribe()
  }, [userId, userRole])

  return (
    <Button variant="outline" size="icon" onClick={onClick} className="relative bg-transparent">
      <MessageCircle className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
          {unreadCount}
        </Badge>
      )}
    </Button>
  )
}
