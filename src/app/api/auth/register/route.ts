import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: parsed.email },
    });

    if (existing) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Email sudah terdaftar" } },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(parsed.password, 12);

    const user = await prisma.user.create({
      data: {
        email: parsed.email,
        passwordHash,
        name: parsed.name,
      },
    });

    return NextResponse.json(
      { id: user.id, email: user.email, name: user.name },
      { status: 201 }
    );

  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Data tidak valid" } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan server" } },
      { status: 500 }
    );
  }
}