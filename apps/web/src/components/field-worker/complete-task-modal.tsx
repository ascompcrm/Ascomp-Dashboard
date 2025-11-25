"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface CompleteTaskModalProps {
  taskId: string
  onClose: () => void
}

export default function CompleteTaskModal({ taskId, onClose }: CompleteTaskModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <Card className="w-full max-w-md border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Complete Task</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This legacy dashboard component is no longer wired to the new workflow, but we keep this modal so the UI
            remains functional. Task ID:
            <span className="font-medium text-foreground"> {taskId}</span>
          </p>

          <Button onClick={onClose} className="w-full bg-black text-white hover:bg-gray-800">
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

