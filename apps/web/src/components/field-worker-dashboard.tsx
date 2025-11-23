"use client"

import { useData } from "@/lib/data-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LogOut, CheckCircle } from "lucide-react"
import { useState } from "react"
import CompleteTaskModal from "./field-worker/complete-task-modal"

export default function FieldWorkerDashboard() {
  const { currentUser, logout, scheduledTasks, sites } = useData()
  const [selectedTask, setSelectedTask] = useState<string | null>(null)

  const myTasks = scheduledTasks.filter((task) => task.fieldWorkerId === currentUser?.id)

  const pendingTasks = myTasks.filter((task) => task.status === "pending")

  const getSiteInfo = (siteId: string) => {
    return sites.find((s) => s.id === siteId)
  }

  const getProjectorInfo = (siteId: string, projectorId: string) => {
    const site = sites.find((s) => s.id === siteId)
    return site?.projectors.find((p) => p.id === projectorId)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Field Worker Dashboard</h1>
            <p className="text-sm text-muted-foreground">Your assigned service tasks</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{currentUser?.name}</p>
              <p className="text-xs text-muted-foreground">Field Worker</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="flex items-center gap-2 border-border bg-transparent"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="border-border bg-white dark:bg-slate-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{pendingTasks.length}</div>
            </CardContent>
          </Card>
          <Card className="border-border bg-white dark:bg-slate-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {myTasks.filter((t) => t.status === "completed").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Tasks */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Assigned Tasks</h2>

          {pendingTasks.length === 0 ? (
            <Card className="border-border bg-muted/20">
              <CardContent className="py-8 text-center">
                <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-foreground font-medium">No pending tasks</p>
                <p className="text-sm text-muted-foreground">You've completed all assigned tasks!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingTasks.map((task) => {
                const site = getSiteInfo(task.siteId)
                const projector = getProjectorInfo(task.siteId, task.projectorId)

                return (
                  <Card key={task.id} className="border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-2">{site?.name}</h3>
                          <div className="text-sm text-muted-foreground space-y-1 mb-3">
                            <p>
                              <strong>Location:</strong> {site?.address}
                            </p>
                            <p>
                              <strong>Projector:</strong> {projector?.name}
                            </p>
                            <p>
                              <strong>Model:</strong> {projector?.model}
                            </p>
                            <p>
                              <strong>Scheduled Date:</strong> {new Date(task.scheduledDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => setSelectedTask(task.id)}
                          className="bg-primary text-primary-foreground hover:bg-primary/90 whitespace-nowrap"
                        >
                          Complete Task
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Completed Tasks History */}
        {myTasks.filter((t) => t.status === "completed").length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Completed Tasks</h2>
            <div className="space-y-3">
              {myTasks
                .filter((t) => t.status === "completed")
                .map((task) => {
                  const site = getSiteInfo(task.siteId)
                  const projector = getProjectorInfo(task.siteId, task.projectorId)

                  return (
                    <Card key={task.id} className="border-border opacity-75">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-foreground">{site?.name}</h3>
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                Completed
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p>
                                <strong>Projector:</strong> {projector?.name}
                              </p>
                              <p>
                                <strong>Completed Date:</strong>{" "}
                                {new Date(task.completedDate || "").toLocaleDateString()}
                              </p>
                              {task.notes && (
                                <p>
                                  <strong>Notes:</strong> {task.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          </div>
        )}
      </div>

      {selectedTask && <CompleteTaskModal taskId={selectedTask} onClose={() => setSelectedTask(null)} />}
    </div>
  )
}
