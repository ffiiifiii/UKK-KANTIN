import { PrismaClient } from "@prisma/client"
import { Request, Response } from "express"

const prisma = new PrismaClient({ errorFormat: "pretty" })

const readMenuDiskon = async (request: Request, response: Response): Promise<any> => {
    try {
        const { search } = request.query
        const dataMenuDiskon = await prisma.menu_diskon.findMany({
            where: {
                menuID: search ? Number(search) : undefined,
            },
            include: {
                menu_details: true,
                diskon_details: true
            }
        })

        const result = dataMenuDiskon.map(item => {
            const diskon = item.diskon_details?.presentase_diskon || 0; // Pastikan diskon ada
            const hargaSetelahDiskon = item.menu_details.harga * (1 - diskon);

            return {
                menuID: item.menu_details.menuID,
                nama_makanan: item.menu_details.nama_makanan,
                harga_awal: item.menu_details.harga,
                presentase_diskon: diskon,
                harga_setelah_diskon: hargaSetelahDiskon,
                jenis: item.menu_details.jenis,
                deskripsi: item.menu_details.deskripsi,
                foto: item.menu_details.foto
            };
        });


        return response.json({
            status: true,
            data: result,
            message: `Menu diskon has been retrived`
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

const createMenuDiskon = async (request: Request, response: Response): Promise<any> => {
    try {
        const { menuID, diskonID } = request.body;

        // Cek apakah menu sudah memiliki diskon
        const existingDiskon = await prisma.menu_diskon.findFirst({
            where: { menuID: Number(menuID) }
        });

        if (existingDiskon) {
            return response.status(400).json({
                status: false,
                message: "Menu ini sudah memiliki diskon dan tidak bisa diberi diskon lagi, update atau delete diskon jika ingin memberikan diskon terbaru"
            });
        }

        const newData = await prisma.menu_diskon.create({
            data: {
                menuID: Number(menuID),
                diskonID: Number(diskonID)
            }
        });

        return response.status(200).json({
            status: true,
            data: newData,
            message: "Menu diskon berhasil dibuat"
        });

    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `Terjadi kesalahan. ${error}`
        });
    }
}

const updateMenuDiskon = async (request: Request, response: Response): Promise<any> => {
    try {
        const { menu_diskonID } = request.params
        const { menuID, diskonID } = request.body

        const findMenuDiskon = await prisma.menu_diskon.findFirst({
            where: { menu_diskonID: Number(menu_diskonID) }
        })

        if (!findMenuDiskon) return response.status(200).json({
            status: false,
            message: `Menu data diskon not found`
        })

        const dataMenuDiskon = await prisma.menu_diskon.update({
            where: { menu_diskonID: Number(menu_diskonID) },
            data: {
                menuID: menuID || findMenuDiskon.menuID,
                diskonID: diskonID || findMenuDiskon.diskonID
            },
            include: {
                menu_details: true,
                diskon_details: true
            },
        })

        return response.json({
            status: true,
            data: dataMenuDiskon,
            message: `Menu diskon has been update`
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

const deleteMenuDiskon = async (request: Request, response: Response): Promise<any> => {
    try {
        const { menu_diskonID } = request.params

        const findMenuDiskon = await prisma.menu_diskon.findFirst({
            where: { menu_diskonID: Number(menu_diskonID) }
        })

        if (!findMenuDiskon) return response.status(200).json({
            status: false,
            message: `Menu data diskon not found`
        })

        const dataMenuDiskon = await prisma.menu_diskon.delete({
            where: { menu_diskonID: Number(menu_diskonID) }
        })

        return response.json({
            status: true,
            message: `Menu diskon has been delete`,
            data: dataMenuDiskon
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


export { createMenuDiskon, readMenuDiskon, updateMenuDiskon, deleteMenuDiskon }