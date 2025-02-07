import { PrismaClient } from "@prisma/client"
import express, { Request, Response } from "express"
import { BASE_URL } from "../global"
import fs from "fs"
import upload from "./uploadImage"
import { error } from "console"

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
const router = express.Router();

const creatMenu = async (request: Request, response: Response): Promise<any> => {
    upload.single('foto')(request, response, async(error) =>{
        try {
            const { nama_makanan, harga, jenis, deskripsi, stanID } = request.body
            const foto =  request.file ? request.file.filename : null
            

            const newMenu = await prisma.menu.create({
                data: {
                    nama_makanan,
                    harga: Number(harga),
                    jenis,
                    deskripsi,
                    foto,
                    stanID: Number(stanID)
                }
            })

            return response.json({
                status: true,
                data: newMenu,
                message: `menu has been created`
            }).status(200)
        } catch (error) {
            return response.json({
                status: false,
                message: `There is an error. ${error}`
            }).status(400)
        }
    });
}

const readMenu = async (request: Request, response: Response): Promise<any> => {
    try {
        const { search } = request.query

        const allMenu = await prisma.menu.findMany({
            where: {
                OR: [
                    { nama_makanan: { contains: search?.toString() || "" } }
                ]
            },
            include: {
                stan_details: true,
                detail_transaksi: { include: { transaksi_details: true } },
                menu_diskon: { include: { diskon_details: true } }
            },
        })

        return response.json({
            status: true,
            data: allMenu,
            message: `menu has been loaded`
        }).status(200)
    } catch (error) {
        return response.json({
            status: false,
            message: `There is an error. ${error}`
        }).status(400)
    }
}

const updateMenu = async (request: Request, response: Response): Promise<any> => {
    upload.single('foto')(request, response, async(error) =>{
    try {
        const { menuID } = request.params
        const { nama_makanan, harga, jenis, deskripsi, stanID } = request.body
        const foto =  request.file ? request.file.filename : null

        const findMenu = await prisma.menu.findFirst({
            where: { menuID: Number(menuID) }
        })

        if (!findMenu)
            return response.status(200).json({
                status: false,
                message: `data menu not found`
            })
        

        const dataMenu = await prisma.menu.update({
            where: { menuID: Number(menuID) },
            data: {
                nama_makanan: nama_makanan || findMenu.nama_makanan,
                harga: harga ? Number(harga) : findMenu.harga,
                jenis: jenis || findMenu.jenis,
                deskripsi: deskripsi || findMenu.deskripsi,
                stanID: stanID ? Number(stanID) : findMenu.stanID,
                foto: foto || findMenu.foto
            },
            include: {
                stan_details: true,
                detail_transaksi: { include: { transaksi_details: true } },
                menu_diskon: { include: { diskon_details: true } }
            },
        })

        return response.json({
            status: true,
            data: dataMenu,
            message: `menu has been update`
        }).status(200)

    } catch (error) {
        return response.json({
            status: false,
            message: error
        }).status(400)
    }
});
}

const deleteMenu = async (request: Request, response: Response): Promise<any> => {
    try {
        const { menuID } = request.params

        const findMenu = await prisma.menu.findFirst({
            where: { menuID: Number(menuID) }
        })

        if (!findMenu) return response.status(400).json({
            status: false,
            message: `menu not found`
        })


        const dataMenu = await prisma.menu.delete({
            where: { menuID: Number(menuID) }
        })

        return response.json({
            status: true,
            data: dataMenu,
            message: `menu has been delete`
        }).status(200)

    } catch (error) {
        return response.json({
            status: false,
            message: `There is an error. ${error}`
        }).status(400)
    }
}
export { creatMenu, readMenu, updateMenu, deleteMenu }