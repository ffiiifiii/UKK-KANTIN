import { PrismaClient } from "@prisma/client"
import { Request, Response } from "express"
import upload from "./uploadImage"

const prisma = new PrismaClient({ errorFormat: "pretty" })

const creatSiswa = async (request: Request, response: Response): Promise<any> => {
    upload.single('foto')(request, response, async (error) => {
        try {
            const { nama_siswa, alamat, telp, userID } = request.body
            const foto = request.file ? request.file.filename : null

            const newData = await prisma.siswa.create({
                data: {
                    nama_siswa,
                    alamat,
                    telp,
                    foto,
                    userID: Number(userID)
                }
            })
            return response.json({
                status: true,
                message: `siswa has been created`,
                data: newData
            }).status(200)
        } catch (error) {
            return response.json({
                status: false,
                message: `There is an error. ${error}`
            }).status(400)
        }
    });
}

const readSiswa = async (request: Request, response: Response): Promise<any> => {
    try {
        const userID = (request as any).user?.userID;

        const admin_stan = await prisma.stan.findFirst({
            where: { userID: Number(userID) }
        });

        if (!admin_stan) {
            return response.status(403).json({
                status: false,
                message: "Unauthorized: hanya admin stan yang dapat melihat data siswa"
            });
        }

        const { search } = request.query

        const dataSiswa = await prisma.siswa.findMany({
            where: {
                nama_siswa: { contains: search?.toString() || "" }
            },
            include: {
                user_details: true,
                transaksi: { include: { stan_details: true } }
            },
        })

        return response.json({
            status: true,
            message: `siswa has retrived`,
            data: dataSiswa
        }).status(200)
        
    } catch (error) {
        return response.json({
            status: false,
            message: `There is an error. ${error}`
        }).status(400)
    }
}

const updateSiswa = async (request: Request, response: Response): Promise<any> => {
    upload.single('foto')(request, response, async (error) => {
        try {

            const { siswaID } = request.params
            const { nama_siswa, alamat, telp, userID } = request.body
            const foto = request.file ? request.file.filename : null

            const findSiswa = await prisma.siswa.findFirst({
                where: { siswaID: Number(siswaID) }
            })

            if (!findSiswa) return response.status(200).json({
                status: false,
                message: `data siswa not found`
            })



            const dataSiswa = await prisma.siswa.update({
                where: { siswaID: Number(siswaID) },
                data: {
                    nama_siswa: nama_siswa || findSiswa.nama_siswa,
                    alamat: alamat || findSiswa.alamat,
                    telp: telp || findSiswa.telp,
                    userID: userID ? Number(userID) : findSiswa.userID,
                    foto: foto || findSiswa.foto
                },
                include: {
                    user_details: true,
                    transaksi: { include: { stan_details: true } }
                },
            })

            return response.json({
                status: true,
                message: `siswa has been update`,
                data: dataSiswa
            }).status(200)
        } catch (error) {
            return response.json({
                status: false,
                message: `There is an error. ${error}`
            }).status(400)
        }
    });
}

const deleteSiswa = async (request: Request, response: Response): Promise<any> => {
    try {
        const { siswaID } = request.params

        const findSiswa = await prisma.siswa.findFirst({
            where: {
                siswaID: Number(siswaID)
            }
        })

        if (!findSiswa) return response.status(400).json({
            status: false,
            message: `siswa not found`
        })


        const dataSiswa = await prisma.siswa.delete({
            where: { siswaID: Number(siswaID) }
        })

        return response.json({
            status: true,
            data: dataSiswa,
            message: `siswa has been deleted`
        }).status(200)
    } catch (error) {
        return response.json({
            status: false,
            message: `There is an error. ${error}`
        }).status(400)
    }
}
export { creatSiswa, readSiswa, updateSiswa, deleteSiswa }