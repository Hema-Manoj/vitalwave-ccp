"use client"

import { useState, useEffect, useRef } from "react"
import { ref, onValue, push, set, update } from "firebase/database"
import { database } from "@/lib/firebase"
import type { ChatMessage } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Send, Ambulance, Building2 } from "lucide-react"

interface ChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userRole: "ambulance" | "hospital"
}

export function ChatDialog({ open, onOpenChange, userId, userRole }: ChatDialogProps) {
  const [selectedContact, setSelectedContact] = useState<string | null>(null)
  const [contacts, setContacts] = useState<any[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (userRole === "hospital") {
      // Load all ambulances
      const ambulancesRef = ref(database, "ambulances")
      const unsubscribe = onValue(ambulancesRef, (snapshot) => {
        if (snapshot.exists()) {
          const ambulanceList = Object.entries(snapshot.val()).map(([id, data]: [string, any]) => ({
            id,
            ...data,
          }))
          setContacts(ambulanceList)
        }
      })
      return () => unsubscribe()
    } else {
      // Load all hospitals
      const hospitalsRef = ref(database, "hospitals")
      const unsubscribe = onValue(hospitalsRef, (snapshot) => {
        if (snapshot.exists()) {
          const hospitalList = Object.entries(snapshot.val()).map(([id, data]: [string, any]) => ({
            id,
            ...data,
          }))
          setContacts(hospitalList)
        }
      })
      return () => unsubscribe()
    }
  }, [userRole])

  useEffect(() => {
    if (selectedContact) {
      const messagesRef = ref(database, "messages")
      const unsubscribe = onValue(messagesRef, (snapshot) => {
        if (snapshot.exists()) {
          const allMessages = Object.entries(snapshot.val()).map(([id, data]: [string, any]) => ({
            id,
            ...data,
          })) as ChatMessage[]

          const filteredMessages = allMessages.filter(
            (msg) =>
              (msg.senderId === userId && msg.receiverId === selectedContact) ||
              (msg.senderId === selectedContact && msg.receiverId === userId),
          )

          filteredMessages.sort((a, b) => a.timestamp - b.timestamp)
          setMessages(filteredMessages)

          // Mark messages as read
          filteredMessages.forEach((msg) => {
            if (msg.receiverId === userId && !msg.read) {
              update(ref(database, `messages/${msg.id}`), { read: true })
            }
          })

          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
        } else {
          setMessages([])
        }
      })

      return () => unsubscribe()
    }
  }, [selectedContact, userId])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return

    const messageRef = push(ref(database, "messages"))
    const message: ChatMessage = {
      id: messageRef.key!,
      senderId: userId,
      senderRole: userRole,
      receiverId: selectedContact,
      message: newMessage.trim(),
      timestamp: Date.now(),
      read: false,
    }

    await set(messageRef, message)
    setNewMessage("")
  }

  const getUnreadCount = (contactId: string) => {
    const messagesRef = ref(database, "messages")
    let count = 0
    onValue(
      messagesRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const allMessages = Object.values(snapshot.val()) as ChatMessage[]
          count = allMessages.filter(
            (msg) => msg.senderId === contactId && msg.receiverId === userId && !msg.read,
          ).length
        }
      },
      { onlyOnce: true },
    )
    return count
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[600px] p-0">
        <div className="flex h-full">
          {/* Contacts List */}
          <div className="w-1/3 border-r">
            <DialogHeader className="p-4 border-b">
              <DialogTitle>Messages</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[calc(100%-60px)]">
              <div className="p-2 space-y-1">
                {contacts.map((contact) => (
                  <Card
                    key={contact.id}
                    className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                      selectedContact === contact.id ? "bg-accent" : ""
                    }`}
                    onClick={() => setSelectedContact(contact.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 bg-primary/10 flex items-center justify-center">
                        {userRole === "hospital" ? (
                          <Ambulance className="h-5 w-5 text-primary" />
                        ) : (
                          <Building2 className="h-5 w-5 text-primary" />
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {userRole === "hospital" ? contact.ambulanceId : contact.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {userRole === "hospital" ? contact.vehicleNumber : contact.address}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedContact ? (
              <>
                <DialogHeader className="p-4 border-b">
                  <DialogTitle>
                    {userRole === "hospital"
                      ? contacts.find((c) => c.id === selectedContact)?.ambulanceId
                      : contacts.find((c) => c.id === selectedContact)?.name}
                  </DialogTitle>
                </DialogHeader>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.senderId === userId ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            msg.senderId === userId ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p className="text-xs opacity-70 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage} size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <p>Select a contact to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
