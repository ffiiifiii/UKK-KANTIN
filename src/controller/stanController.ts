import { PrismaClient } from "@prisma/client"
import { Request, Response } from "express"

const prisma = new PrismaClient({ errorFormat: "pretty" })


const createStan = async (request: Request, response: Response): Promise<any> => {
    try {
        const { nama_stan, nama_pemilik, telp, userID } = request.body

        const newData = await prisma.stan.create({
            data: {
                nama_stan,
                nama_pemilik,
                telp,
                userID
            }
        })
        return response.json({
            status: true,
            data: newData,
            message: `stan has been created`
        }).status(200)

    } catch (error) {
        return response
            .json({
                status: false,
                message: `There is an error. ${error}`
            })
            .status(400)
    }
}

const readStan = async (request: Request, response: Response): Promise<any> => {
    try {
        const { search } = request.query
        const dataStan = await prisma.stan.findMany({
            where: {
                nama_stan: { contains: search?.toString() || "" }
            },
            include: {
                user_details: true,
                menu: { include: { stan_details: true } },
                diskon: { include: { menu_diskon: true } },
                transaksi: { include: { siswa_details: true } }
            },
        })

        return response.json({
            status: true,
            data: dataStan,
            message: `stan has been retrived`
        }).status(200)

    } catch (error) {
        return response
            .json({
                status: false,
                message: `There is an error. ${error}`
            })
            .status(400)
    }
}

const updateStan = async (request: Request, response: Response): Promise<any> => {
    try {
        const { stanID } = request.params
        const { nama_stan, nama_pemilik, telp, userID } = request.body

        const findStan = await prisma.stan.findFirst({
            where: { stanID: Number(stanID) }
        })

        if (!findStan) return response.status(200).json({
            status: false,
            message: `data stan not found`
        })


        const dataStan = await prisma.stan.update({
            where: { stanID: Number(stanID) },
            data: {
                nama_stan: nama_stan || findStan.nama_stan,
                nama_pemilik: nama_pemilik || findStan.nama_pemilik,
                telp: telp || findStan.telp,
                userID: userID || findStan.userID
            },
            include: {
                user_details: true,
                menu: { include: { stan_details: true } },
                diskon: { include: { menu_diskon: true } },
                transaksi: { include: { siswa_details: true } }
            },
        })

        return response.json({
            status: true,
            data: dataStan,
            message: `stan has been update`
        }).status(200)

    } catch (error) {
        return response
            .json({
                status: false,
                message: `There is an error. ${error}`
            })
            .status(400)
    }
}

const deleteStan = async (request: Request, response: Response): Promise<any> => {
    try {
        const { stanID } = request.params

        const findStan = await prisma.stan.findFirst({
            where: {
                stanID: Number(stanID),
            }
        })

        if (!findStan) return response.status(200).json({
            status: false,
            message: `stan not found`
        })


        const dataStan = await prisma.stan.delete({
            where: { stanID: Number(stanID) }
        })

        return response.json({
            status: true,
            data: dataStan,
            message: `data has been deleted`
        }).status(200)

    } catch (error) {
        return response
            .json({
                status: false,
                message: `There is an error. ${error}`
            })
            .status(400)
    }
}
export { createStan, readStan, updateStan, deleteStan }