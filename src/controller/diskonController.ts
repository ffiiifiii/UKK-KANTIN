import { PrismaClient } from "@prisma/client"
import { Request, Response } from "express"


const prisma = new PrismaClient({ errorFormat: "pretty" })

const creatDiskon = async (request: Request, response: Response): Promise<any> => {
    try {
        const { nama_diskon, presentase_diskon, tanggal_awal, tanggal_akhir } = request.body

        const newData = await prisma.diskon.create({
            data: {
                nama_diskon,
                presentase_diskon,
                tanggal_awal,
                tanggal_akhir
            }
        })
        return response.json({
            status: true,
            data: newData,
            message: `diskon has been created`
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

const readDiskon = async (request: Request, response: Response): Promise<any> => {
    try {
        const { search } = request.query
        const dataDiskon = await prisma.diskon.findMany({
            where: {
                nama_diskon: { contains: search?.toString() || "" }
            },
            include: {
                stan_detail: true,
                menu_diskon: { include: { diskon_details: true } }
            },
        })

        return response.json({
            status: true,
            data: dataDiskon,
            message: `diskon has been retrived`
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

const updateDiskon = async (request: Request, response: Response): Promise<any> => {
    try {
        const { diskonID } = request.params
        const { nama_diskon, presentase_diskon, tanggal_awal, tanggal_akhir, stanID } = request.body


        const findDiskon = await prisma.diskon.findFirst({
            where: { diskonID: Number(diskonID) }
        })

        if (!findDiskon) return response.status(200).json({
            status: false,
            message: `data diskon not found`
        })


        const dataDiskon = await prisma.diskon.update({
            where: { diskonID: Number(diskonID) },
            data: {
                nama_diskon: nama_diskon || findDiskon.nama_diskon,
                presentase_diskon: presentase_diskon || findDiskon.presentase_diskon,
                tanggal_awal: tanggal_awal || findDiskon.tanggal_awal,
                tanggal_akhir: tanggal_akhir || findDiskon.tanggal_akhir,
                stanID: stanID || findDiskon.stanID
            },
            include: {
                stan_detail: true,
                menu_diskon: { include: { diskon_details: true } }
            },
        })

        return response.json({
            status: true,
            data: dataDiskon,
            message: `diskon has been update`
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

const deleteDiskon = async (request: Request, response: Response): Promise<any> => {
    try {
        const diskonID = request.params

        const findDiskon = await prisma.diskon.findFirst({
            where: { diskonID: Number(diskonID) }
        })

        if (!findDiskon) return response.status(200).json({
            status: false,
            message: `diskon not found`
        })


        const dataDiskon = await prisma.diskon.delete({
            where: { diskonID: Number(diskonID) }
        })

        return response.json({
            status: true,
            message: `diskon has been delete`,
            data: dataDiskon
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
export { creatDiskon, readDiskon, updateDiskon, deleteDiskon }