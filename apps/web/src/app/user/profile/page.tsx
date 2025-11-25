"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface ProfileData {
  user: {
    id: string
    name: string | null
    email: string
    role: string
    joinDate: string
    image: string | null
  }
  stats: {
    totalServices: number
    completedServices: number
    activeServices: number
    uniqueSites: number
    uniqueProjectors: number
    lastServiceDate: string | null
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const { user: authUser, isLoading } = useAuth()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      if (!authUser) {
        router.push("/login")
        return
      }
      fetchProfile()
    }
  }, [authUser, isLoading, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setProfileData(data)
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading || !profileData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-black">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b-2 border-black p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 border-2 border-black hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-black">Profile</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        {/* User Information */}
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-black">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide mb-1">Name</p>
                <p className="text-lg font-semibold text-black">{profileData.user.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide mb-1">Email</p>
                <p className="text-lg font-semibold text-black">{profileData.user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide mb-1">Role</p>
                <p className="text-lg font-semibold text-black">{profileData.user.role}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide mb-1">Join Date</p>
                <p className="text-lg font-semibold text-black">{formatDate(profileData.user.joinDate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Statistics */}
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-black">Work Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="text-center p-4 border-2 border-black">
                <p className="text-3xl font-bold text-black mb-2">{profileData.stats.totalServices}</p>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Total Services</p>
              </div>
              <div className="text-center p-4 border-2 border-black">
                <p className="text-3xl font-bold text-black mb-2">{profileData.stats.completedServices}</p>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Completed</p>
              </div>
              <div className="text-center p-4 border-2 border-black">
                <p className="text-3xl font-bold text-black mb-2">{profileData.stats.activeServices}</p>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Active</p>
              </div>
              <div className="text-center p-4 border-2 border-black">
                <p className="text-3xl font-bold text-black mb-2">{profileData.stats.uniqueSites}</p>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Unique Sites</p>
              </div>
              <div className="text-center p-4 border-2 border-black">
                <p className="text-3xl font-bold text-black mb-2">{profileData.stats.uniqueProjectors}</p>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Projectors</p>
              </div>
              <div className="text-center p-4 border-2 border-black">
                <p className="text-sm font-semibold text-black mb-2">
                  {profileData.stats.lastServiceDate ? formatDate(profileData.stats.lastServiceDate) : "N/A"}
                </p>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Last Service</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

