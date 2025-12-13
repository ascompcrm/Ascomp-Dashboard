import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "public", "data")

const FILE_MAP: Record<string, { filename: string; key: string }> = {
  "content-player": { filename: "Content_Player.json", key: "Content Player" },
  "lamp-models": { filename: "Lamp_Models.json", key: "Lamp Model" },
  "software": { filename: "Software.json", key: "Software Version" },
  "projector": { filename: "Projector.json", key: "projector_parts" },
}

async function readDataFile(fileType: string) {
  const fileInfo = FILE_MAP[fileType]
  if (!fileInfo) {
    throw new Error(`Unknown file type: ${fileType}`)
  }

  const filePath = path.join(DATA_DIR, fileInfo.filename)
  try {
    const rawData = await fs.readFile(filePath, "utf-8")
    // Clean up any extra whitespace/newlines that might cause parsing issues
    const cleanedData = rawData.trim().replace(/^\s*[\r\n]+/gm, '')
    const parsed = JSON.parse(cleanedData)
    return parsed
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return fileType === "projector" ? { projector_parts: [] } : []
    }
    console.error(`Error parsing ${fileInfo.filename}:`, error.message)
    throw error
  }
}

async function writeDataFile(fileType: string, data: any) {
  const fileInfo = FILE_MAP[fileType]
  if (!fileInfo) {
    throw new Error(`Unknown file type: ${fileType}`)
  }

  const filePath = path.join(DATA_DIR, fileInfo.filename)
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8")
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileType: string }> }
) {
  try {
    const { fileType } = await params
    const data = await readDataFile(fileType)
    
    // For lamp-models, return the structured data
    if (fileType === "lamp-models") {
      // Extract the Lamp_Model array from the structure
      const lampModelData = Array.isArray(data) && data[0]?.Lamp_Model 
        ? data[0].Lamp_Model 
        : []
      return NextResponse.json({ data: lampModelData }, {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      })
    }
    
    // For simple arrays, extract just the values
    if (fileType === "content-player" || fileType === "software") {
      const fileInfo = FILE_MAP[fileType]
      if (!fileInfo) {
        return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
      }
      const key = fileInfo.key
      const values = Array.isArray(data)
        ? data.map((item: any) => item[key]).filter((v: any) => v && v.trim() !== "" && v.toUpperCase() !== "NA")
        : []
      return NextResponse.json({ values }, {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      })
    }
    
    // For projector, return the full structure
    if (fileType === "projector") {
      return NextResponse.json({ data: data.projector_parts || [] })
    }

    return NextResponse.json({ data })
  } catch (error) {
    const { fileType } = await params
    console.error(`Error reading ${fileType}:`, error)
    return NextResponse.json(
      { error: `Failed to read ${fileType}`, details: String(error) },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ fileType: string }> }
) {
  try {
    const { fileType } = await params
    const body = await request.json()
    
    // Handle lamp-models with structured data
    if (fileType === "lamp-models") {
      const { data } = body
      
      if (!Array.isArray(data)) {
        return NextResponse.json({ error: "Data must be an array" }, { status: 400 })
      }
      
      // Wrap in the expected structure: [{ Lamp_Model: [...] }]
      const wrappedData = [{ Lamp_Model: data }]
      await writeDataFile(fileType, wrappedData)
      
      return NextResponse.json({ success: true, saved: data.length })
    }
    
    if (fileType === "content-player" || fileType === "software") {
      const fileInfo = FILE_MAP[fileType]
      const { values } = body
      
      if (!Array.isArray(values)) {
        return NextResponse.json({ error: "Values must be an array" }, { status: 400 })
      }

      if (!fileInfo) {
        return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
      }
      // Convert array of strings to array of objects
      const data = values.map((value: string) => ({ [fileInfo.key]: value }))
      await writeDataFile(fileType, data)
      
      return NextResponse.json({ success: true, saved: values.length })
    }
    
    if (fileType === "projector") {
      const { data } = body
      if (!Array.isArray(data)) {
        return NextResponse.json({ error: "Data must be an array" }, { status: 400 })
      }
      
      await writeDataFile(fileType, { projector_parts: data })
      return NextResponse.json({ success: true, saved: data.length })
    }

    return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
  } catch (error) {
    const { fileType } = await params
    console.error(`Error writing ${fileType}:`, error)
    return NextResponse.json(
      { error: `Failed to save ${fileType}` },
      { status: 500 }
    )
  }
}
