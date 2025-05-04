import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken"; //verifikasi JWT
import { PrismaClient} from "@prisma/client"

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

  //harus diawali dengan token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return response.status(401).json({
      message: "Access denied. Token must be in 'Bearer <token>' format."
    }).status(401)
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.JWT_SECRET_KEY || "";
    const verified = verify(token, secret) as JwtPayload;

    //cek role
    if (verified.role !== "siswa" && verified.role !== "admin_stan") {
      return response.json({
        message: "Forbidden. Only siswa or admin can access this route."
      }).status(403)
    }


    //verifikasi ke database
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
