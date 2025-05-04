import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { PrismaClient, status } from "@prisma/client"

const prisma = new PrismaClient({ errorFormat: "pretty" })

interface JwtPayload {
  id: string;
  role: string;
  [key: string]: any;
}

// Extend Express Request agar bisa menyimpan `user`
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const verifyToken = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<any> => {
  const authHeader = request.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return response.status(401).json({
      message: "Access denied. Token must be in 'Bearer <token>' format."
    }).status(401)
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.JWT_SECRET_KEY || "";
    const verified = verify(token, secret) as JwtPayload;

    if (verified.role !== "siswa" && verified.role !== "admin_stan") {
      return response.json({
        message: "Forbidden. Only siswa or admin can access this route."
      }).status(403)
    }


    //   [Optional] Validasi ke DB pakai Prisma (jika mau pastikan user valid)
    const user = await prisma.users.findUnique({ where: { userID: verified.userID } });
    if (!user) {
      return response.json({
        message: "User tidak ditemukan di database"
      }).status(404)
    }

    request.user = verified;

    next();

  } catch (error) {
    return response.json({
      message: "Invalid or expired token"
    }).status(401)
  }
};
