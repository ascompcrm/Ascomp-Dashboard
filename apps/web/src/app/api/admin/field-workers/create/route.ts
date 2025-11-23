import { NextRequest, NextResponse } from "next/server"
import { auth } from "@my-better-t-app/auth"
import { Resend } from "resend"
import prisma from "@my-better-t-app/db"
import { Role } from "../../../../../../../../packages/db/prisma/generated/enums"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email || !name) {
      return NextResponse.json({ error: "Email and name are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Generate password: Ascomp + random 4 digits
    const randomDigits = Math.floor(1000 + Math.random() * 9000)
    const password = `Ascomp${randomDigits}`

    // Create user using better-auth sign-up
    const origin = request.headers.get("origin") || process.env.CORS_ORIGIN || "http://localhost:3000"
    const url = new URL("/api/auth/sign-up/email", origin)
    const signUpRequest = new Request(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        name,
        role: "FIELD_WORKER",
      }),
    })

    const signUpResponse = await auth.handler(signUpRequest)

    if (!signUpResponse.ok) {
      const errorText = await signUpResponse.text()
      console.error("Failed to create user:", errorText)
      return NextResponse.json(
        { error: "Failed to create field worker account" },
        { status: 500 },
      )
    }

    const signUpData = await signUpResponse.json()

    if (!signUpData || !signUpData.user) {
      return NextResponse.json(
        { error: "Failed to create field worker account" },
        { status: 500 },
      )
    }

    // Ensure role is set to FIELD_WORKER
    await prisma.user.update({
      where: { id: signUpData.user.id },
      data: { role: Role.FIELD_WORKER },
    })

    // Send email with login credentials
    if (resend) {
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
          to: email,
          subject: "Welcome to Ascomp CRM - Your Login Credentials",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Welcome to Ascomp CRM!</h2>
              <p>Hello ${name},</p>
              <p>Your account has been created. Please use the following credentials to log in:</p>
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
              </div>
              <p>Please log in at: <a href="${origin}/login">${origin}/login</a></p>
              <p style="color: #666; font-size: 12px; margin-top: 30px;">For security reasons, please change your password after your first login.</p>
            </div>
          `,
        })
      } catch (emailError) {
        console.error("Failed to send email:", emailError)
        // Don't fail the request if email fails, but log it
      }
    } else {
      console.warn("RESEND_API_KEY not configured. Email not sent. Password:", password)
    }

    return NextResponse.json({
      success: true,
      user: {
        id: signUpData.user.id,
        email: signUpData.user.email,
        name: signUpData.user.name,
      },
      message: "Field worker created successfully. Login credentials have been sent to their email.",
    })
  } catch (error) {
    console.error("Error creating field worker:", error)
    return NextResponse.json(
      { error: "Failed to create field worker" },
      { status: 500 },
    )
  }
}

