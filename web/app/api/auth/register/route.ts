export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { email, password, name } = await req.json();

  const em = String(email || "").toLowerCase().trim();
  const pw = String(password || "");

  if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em))
    return NextResponse.json({ error: "Ungültige E-Mail" }, { status: 400 });
  if (pw.length < 8)
    return NextResponse.json({ error: "Passwort zu kurz (min. 8 Zeichen)" }, { status: 400 });

  const exists = await prisma.userAccount.findUnique({ where: { email: em } });
  if (exists) return NextResponse.json({ error: "E-Mail bereits registriert" }, { status: 409 });

  const hash = await bcrypt.hash(pw, 12);
  await prisma.userAccount.create({
    data: { email: em, passwordHash: hash, name: name || null },
  });

  return NextResponse.json({ ok: true });
}
