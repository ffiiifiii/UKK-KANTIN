import { PrismaClient } from "@prisma/client"
import { Request, Response } from "express"

const prisma = new PrismaClient({ errorFormat: "pretty" })

const createStan = async (request: Request, response: Response): Promise<any> => {
    try {
        const userID = (request as any).user?.userID;
        const { nama_stan, nama_pemilik, telp } = request.body;

        if (!userID) {
            return response.status(401).json({
                status: false,
                message: "Unauthorized: userID tidak ditemukan dalam token"
            });
        }

        // Cek apakah user sudah memiliki stan
        const existingStan = await prisma.stan.findFirst({
            where: { userID: Number(userID) }
        });

        if (existingStan) {
            return response.status(403).json({
                status: false,
                message: "Anda sudah memiliki stan, tidak dapat membuat lebih dari satu stan"
            });
        }

        const newData = await prisma.stan.create({
            data: {
                nama_stan,
                nama_pemilik,
                telp,
                userID: Number(userID)
            }
        });

        return response.status(200).json({
            status: true,
            data: newData,
            message: `Stan berhasil dibuat`
        });

    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `Terjadi kesalahan: ${error}`
        });
    }
}

const readStan = async (request: Request, response: Response): Promise<any> => {
    try {
        const userID = (request as any).user?.userID;
        const role = (request as any).user?.role; 

        const { search } = request.query;

        let dataStan;

        if (role === "admin_stan") {
            
            // Admin hanya bisa melihat stannya sendiri
            dataStan = await prisma.stan.findMany({
                where: {
                    userID: Number(userID),
                    nama_stan: { contains: search?.toString() || "" }
                },
                include: {
                    user_details: true,
                    menu: { include: { stan_details: true } },
                    diskon: { include: { menu_diskon: true } },
                    transaksi: { include: { siswa_details: true } }
                }
            });
        } else if (role === "siswa") {
            // Siswa bisa melihat semua stan
            dataStan = await prisma.stan.findMany({
                where: {
                    nama_stan: { contains: search?.toString() || "" }
                },
                include: {
                    user_details: true,
                    menu: { include: { stan_details: true } },
                    diskon: { include: { menu_diskon: true } },
                    transaksi: { include: { siswa_details: true } }
                }
            });
        } else {
            return response.status(403).json({
                status: false,
                message: "Akses ditolak: Hanya siswa dan admin stan yang bisa mengakses data stan"
            });
        }

        return response.status(200).json({
            status: true,
            data: dataStan,
            message: `Stan berhasil ditampilkan`
        });

    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `Terjadi kesalahan: ${error}`
        });
    }
}

const updateStan = async (request: Request, response: Response): Promise<any> => {
    try {
        const userID = (request as any).user?.userID;
        const { stanID } = request.params;
        const { nama_stan, nama_pemilik, telp } = request.body;

        const findStan = await prisma.stan.findFirst({
            where: { stanID: Number(stanID) }
        });

        if (!findStan) {
            return response.status(404).json({
                status: false,
                message: `Data stan tidak ditemukan`
            });
        }

        // Pastikan hanya pemilik stan (user) yang bisa mengupdate
        if (findStan.userID !== Number(userID)) {
            return response.status(403).json({
                status: false,
                message: "Akses ditolak: Anda bukan pemilik stan ini"
            });
        }

        const dataStan = await prisma.stan.update({
            where: { stanID: Number(stanID) },
            data: {
                nama_stan: nama_stan || findStan.nama_stan,
                nama_pemilik: nama_pemilik || findStan.nama_pemilik,
                telp: telp || findStan.telp
            },
            include: {
                user_details: true,
                menu: { include: { stan_details: true } },
                diskon: { include: { menu_diskon: true } },
                transaksi: { include: { siswa_details: true } }
            }
        });

        return response.status(200).json({
            status: true,
            data: dataStan,
            message: `Stan berhasil diperbarui`
        });

    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `Terjadi kesalahan: ${error}`
        });
    }
}

const deleteStan = async (request: Request, response: Response): Promise<any> => {
    try {
        const userID = (request as any).user?.userID;
        const { stanID } = request.params;

        const findStan = await prisma.stan.findFirst({
            where: { stanID: Number(stanID) }
        });

        if (!findStan) {
            return response.status(404).json({
                status: false,
                message: `Stan tidak ditemukan`
            });
        }

        // Cek apakah user yang login adalah pemilik stan
        if (findStan.userID !== Number(userID)) {
            return response.status(403).json({
                status: false,
                message: "Akses ditolak: Anda bukan pemilik stan ini"
            });
        }

        const dataStan = await prisma.stan.delete({
            where: { stanID: Number(stanID) }
        });

        return response.status(200).json({
            status: true,
            data: dataStan,
            message: `Stan berhasil dihapus`
        });

    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `Terjadi kesalahan: ${error}`
        });
    }
}

export { createStan, readStan, updateStan, deleteStan }