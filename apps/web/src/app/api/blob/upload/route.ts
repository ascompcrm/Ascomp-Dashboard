import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || ""

    if (contentType.includes("application/json")) {
      const { dataUrl, role } = await request.json()
      if (!dataUrl) {
        return NextResponse.json({ error: "dataUrl is required" }, { status: 400 })
      }
      const buffer = Buffer.from(dataUrl.split(",")[1], "base64")
      const filename = `signatures/${role || "signature"}-${Date.now()}.png`
      const blob = await put(filename, buffer, {
        access: "public",
        contentType: "image/png",
      })
      return NextResponse.json({ url: blob.url, pathname: blob.pathname })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const folder = (formData.get("folder") as string) || "uploads"

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 })
    }

    const filename = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`

    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
    })

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
    })
  } catch (error) {
    console.error("Blob upload failed:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
