"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface ProfileData {
  user: {
    id: string
    name: string | null
    email: string
    role: string
    joinDate: string
    image: string | null
    phoneNumber: string | null
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
      setLoading(true)
      const response = await fetch("/api/user/profile", {
        credentials: "include",
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Failed to fetch profile:", errorData.error || "Unknown error")
        toast.error("Failed to load profile data")
        return
      }
      const data = await response.json()
      setProfileData(data)
    } catch (error) {
      console.error("Failed to fetch profile:", error)
      toast.error("Network error while loading profile")
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

  const formatRole = (role: string) => {
    if (!role) return "N/A"
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  }

  if (loading || !profileData) {
    return (
      <div className="min-h-screen w-full bg-white">
        <div className="border-b-2 border-black p-4 sm:p-6">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-10 w-24 mb-4 rounded" />
            <Skeleton className="h-10 w-48 rounded" />
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
          {/* User Information Skeleton */}
          <Card className="border-2 border-black">
            <CardHeader>
              <Skeleton className="h-7 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-6 w-full max-w-[200px]" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Work Statistics Skeleton */}
          <Card className="border-2 border-black">
            <CardHeader>
              <Skeleton className="h-7 w-40" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="text-center p-4 border-2 border-gray-200">
                    <Skeleton className="h-8 w-16 mx-auto mb-2" />
                    <Skeleton className="h-4 w-24 mx-auto" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b-2 border-black p-4 sm:p-6 sticky top-0 bg-white z-10 transition-all">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 border-2 border-transparent hover:border-black hover:bg-transparent -ml-3"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-black">Profile</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-500">
        {/* User Information */}
        <Card className="border-2 border-black hover:shadow-sm transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-black">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">Name</p>
                <p className="text-lg font-medium text-black">{profileData.user.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">Email</p>
                <p className="text-lg font-medium text-black">{profileData.user.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">Phone Number</p>
                <p className="text-lg font-medium text-black">{profileData.user.phoneNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">Role</p>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                  {formatRole(profileData.user.role)}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">Join Date</p>
                <p className="text-lg font-medium text-black">{formatDate(profileData.user.joinDate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Statistics */}
        <Card className="border-2 border-black hover:shadow-sm transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-black">Work Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border-2 border-gray-100 rounded-lg hover:border-black transition-colors">
                <p className="text-3xl font-bold text-black mb-1">{profileData.stats.totalServices}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Services</p>
              </div>
              <div className="text-center p-4 border-2 border-gray-100 rounded-lg hover:border-black transition-colors">
                <p className="text-3xl font-bold text-green-600 mb-1">{profileData.stats.completedServices}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Completed</p>
              </div>
              <div className="text-center p-4 border-2 border-gray-100 rounded-lg hover:border-black transition-colors">
                <p className="text-3xl font-bold text-blue-600 mb-1">{profileData.stats.activeServices}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Active</p>
              </div>
              <div className="text-center p-4 border-2 border-gray-100 rounded-lg hover:border-black transition-colors">
                <p className="text-3xl font-bold text-black mb-1">{profileData.stats.uniqueSites}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Unique Sites</p>
              </div>
              <div className="text-center p-4 border-2 border-gray-100 rounded-lg hover:border-black transition-colors">
                <p className="text-3xl font-bold text-black mb-1">{profileData.stats.uniqueProjectors}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Projectors</p>
              </div>
              <div className="text-center p-4 border-2 border-gray-100 rounded-lg hover:border-black transition-colors">
                 <div className="h-[36px] flex items-center justify-center mb-1"> 
                    <p className="text-sm font-bold text-black">
                      {profileData.stats.lastServiceDate ? formatDate(profileData.stats.lastServiceDate) : "N/A"}
                    </p>
                 </div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Last Service</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
