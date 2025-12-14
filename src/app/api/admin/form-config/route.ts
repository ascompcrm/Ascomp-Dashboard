import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const CONFIG_FILE_PATH = path.join(process.cwd(), "data", "form-config.json")

async function ensureConfigDir() {
  const dir = path.dirname(CONFIG_FILE_PATH)
  try {
    await fs.access(dir)
  } catch {
    await fs.mkdir(dir, { recursive: true })
  }
}

async function readConfig(): Promise<any[] | null> {
  try {
    await ensureConfigDir()
    const data = await fs.readFile(CONFIG_FILE_PATH, "utf-8")
    return JSON.parse(data)
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return null
    }
    console.error("Error reading form config:", error)
    return null
  }
}

async function writeConfig(config: any[]): Promise<void> {
  try {
    await ensureConfigDir()
    const configString = JSON.stringify(config, null, 2)
    console.log("Writing form config to:", CONFIG_FILE_PATH)
    await fs.writeFile(CONFIG_FILE_PATH, configString, "utf-8")
  } catch (error) {
    console.error("Error writing form config:", error)
    throw error
  }
}

export async function GET() {
  try {
    const config = await readConfig()
    return NextResponse.json({ config }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    })
  } catch (error) {
    console.error("Error fetching form config:", error)
    return NextResponse.json({ error: "Failed to fetch form config" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { config } = body

    if (!config || !Array.isArray(config)) {
      console.error("Invalid config format:", typeof config, Array.isArray(config))
      return NextResponse.json({ error: "Invalid config format" }, { status: 400 })
    }

    await writeConfig(config)

    return NextResponse.json({ success: true, message: "Form configuration saved", savedFields: config.length })
  } catch (error) {
    console.error("Error saving form config:", error)
    return NextResponse.json({ error: "Failed to save form config", details: String(error) }, { status: 500 })
  }
}
