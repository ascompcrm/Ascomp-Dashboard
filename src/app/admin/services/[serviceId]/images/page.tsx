"use client"

import { use, useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

interface ImagesPageProps {
  params: Promise<{ serviceId: string }>
}

export default function ServiceImagesPage({ params }: ImagesPageProps) {
  const { serviceId } = use(params)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [serviceData, setServiceData] = useState<{
    images: string[]
    afterImages: string[]
    brokenImages: string[]
    serviceNumber?: number
    date?: string
    cinemaName?: string
  } | null>(null)

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/admin/service-records/${serviceId}`, {
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch service record")
        }

        const { service } = await response.json()
        setServiceData({
          images: service.images || [],
          afterImages: service.afterImages || [],
          brokenImages: service.brokenImages || [],
          serviceNumber: service.serviceNumber,
          date: service.date,
          cinemaName: service.cinemaName || service.site?.siteName,
        })
      } catch (err) {
        console.error("Error fetching service:", err)
        setError("Failed to load service images")
      } finally {
        setLoading(false)
      }
    }

    fetchService()
  }, [serviceId])

  const Section = ({ title, images, emptyMessage }: { title: string; images: string[]; emptyMessage?: string }) => {
    if (images.length === 0) {
      if (emptyMessage) {
        return (
          <div className="border border-black mb-6 break-inside-avoid shadow-sm rounded-sm bg-white">
            <div className="bg-gray-100 border-b border-black px-4 py-3 font-bold text-base text-black uppercase tracking-wide">
              {title}
            </div>
            <div className="p-6 text-center text-gray-500">
              <p>{emptyMessage}</p>
            </div>
          </div>
        )
      }
      return null
    }

    return (
      <div className="border border-black mb-6 break-inside-avoid shadow-sm rounded-sm bg-white">
        <div className="bg-gray-100 border-b border-black px-4 py-3 font-bold text-base text-black uppercase tracking-wide">
          {title} ({images.length})
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((imageUrl, index) => (
              <div key={index} className="relative aspect-video border border-gray-300 rounded overflow-hidden bg-gray-100">
                <Image
                  src={imageUrl}
                  alt={`${title} ${index + 1}`}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-sm text-gray-500">Loading images...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white w-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/admin/dashboard/overview">
            <Button variant="outline">Go Back</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!serviceData) {
    return (
      <div className="min-h-screen bg-white w-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Service record not found</p>
          <Link href="/admin/dashboard/overview">
            <Button variant="outline">Go Back</Button>
          </Link>
        </div>
      </div>
    )
  }

  const hasAnyImages =
    serviceData.images.length > 0 ||
    serviceData.afterImages.length > 0 ||
    serviceData.brokenImages.length > 0

  return (
    <div className="min-h-screen bg-white w-full pb-12">
      {/* Header */}
      <div className="border-b-2 border-black p-4 sticky top-0 bg-white/95 backdrop-blur z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard/overview">
              <Button
                variant="ghost"
                size="sm"
                className="border-2 border-transparent hover:border-black hover:bg-transparent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-black">
                Service Images
                {serviceData.serviceNumber && (
                  <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 ml-2">
                    Service #{serviceData.serviceNumber}
                  </span>
                )}
              </h1>
              {serviceData.cinemaName && (
                <p className="text-sm text-gray-600">{serviceData.cinemaName}</p>
              )}
              {serviceData.date && (
                <p className="text-xs text-gray-500">
                  {new Date(serviceData.date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {!hasAnyImages ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No images available for this service record.</p>
          </div>
        ) : (
          <>
            <Section
              title="Before Service Images"
              images={serviceData.images}
              emptyMessage="No before service images available"
            />
            <Section
              title="After Service Images"
              images={serviceData.afterImages}
              emptyMessage="No after service images available"
            />
            <Section
              title="Broken/Damaged Items"
              images={serviceData.brokenImages}
              emptyMessage="No broken/damaged item images available"
            />
          </>
        )}
      </div>
    </div>
  )
}