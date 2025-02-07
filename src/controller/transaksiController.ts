import { PrismaClient, status } from "@prisma/client"
import { Request, Response } from "express"
import fs from "fs"
import path from "path"

const prisma = new PrismaClient({ errorFormat: "pretty" })

const readTransaksi = async (request: Request, response: Response): Promise<any> => {
    try {
        const { search } = request.params

        const dataTransaksi = await prisma.transaksi.findMany({
            where: {
                transaksiID: search ? Number(search) : undefined,
            },
            include: {
                stan_details: true,
                siswa_details: true,
                detail_transaksi: { include: { menu_details: true } }
            }
        });

        const transaksiWithNota = dataTransaksi.map((transaksi_details) => {
            if (!transaksi_details.detail_transaksi || transaksi_details.detail_transaksi.length === 0) {
                return { ...transaksi_details, total: 0 };
            }

            const total = transaksi_details.detail_transaksi.reduce((acc, detail) => {
                const harga = detail.menu_details?.harga ?? 0;
                const qty = detail.qty ?? 0;
                return acc + (qty * harga)
            }, 0);

            return {
                transaksiID: transaksi_details.transaksiID,
                tanggal: transaksi_details.tanggal,
                nama_siswa: transaksi_details.siswa_details.nama_siswa,
                nama_stan: transaksi_details.stan_details.nama_stan,
                items: transaksi_details.detail_transaksi.map((detail) => ({
                    nama_makanan: detail.menu_details.nama_makanan,
                    qty: detail.qty,
                    harga: detail.menu_details.harga,
                    subtotal: detail.qty * detail.menu_details.harga
                })),
                total: total
            }
        })
        return response.json({
            status: true,
            data: transaksiWithNota,
            message: `data transaksi has retrieved`
        }).status(200)

    } catch (error) {
        return response.json({
            status: false,
            message: `there is an error. ${error}`
        }).status(500)
    }
}

const createTransaksi = async (request: Request, response: Response): Promise<any> => {
    try {
        const { tanggal, stanID, siswaID, status, detail_transaksi } = request.body

        const parsedDate = new Date(tanggal);
        if (isNaN(parsedDate.getTime())) {
            return response.status(400).json({
                status: false,
                message: "Invalid tanggal format. Please use a valid ISO-8601 DateTime format."
            });
        }

        //array untuk menyimpan detail transaksi setelah harga diambil dari menu
        const transaksiDetailsWithPrice = await Promise.all(
            detail_transaksi.map(async (detail: any) => {

                const menu_details = await prisma.menu.findUnique({
                    where: { menuID: detail.menuID }
                });

                if (!menu_details) return response.json({
                    status: false,
                    message: `menu not found`
                }).status(200)

                return {
                    menuID: detail.menuID,
                    harga: menu_details.harga,
                    qty: detail.qty
                }

            })
        )

        // Membuat transaksi baru
        const newTransaksi = await prisma.transaksi.create({
            data: {
                tanggal,
                stanID: Number(stanID),
                siswaID: Number(siswaID),
                status,
                detail_transaksi: {
                    create: transaksiDetailsWithPrice
                }
            },
            include: {
                stan_details: true,
                siswa_details: true,
                detail_transaksi: { include: { menu_details: true } }
            }
        })

        // for (let index = 0; index < detail_transaksi.length; index++) {
        //     const {menuID, qty, harga_beli} = detail_transaksi[index]
        //     await prisma.detail_transaksi.create({
        //         data: {
        //             transaksiID: newTransaksi.transaksiID,
        //             menuID: Number(menuID),
        //             qty: Number(qty),
        //             harga_beli: Number(harga_beli)
        //         }
        //     })
        // }

        return response.json({
            status: true,
            data: newTransaksi,
            message: `transaksi has been created`
        }).status(200)


    } catch (error) {
        return response.status(500).json({
            status: false,
            message: `There is an error. ${error}`
        });
    }
};

const updateTransaksi = async (request: Request, response: Response): Promise<any> => {
    try {
        const { transaksiID } = request.params
        const { tanggal, stanID, siswaID, status } = request.body

        const findTransaksi = await prisma.transaksi.findFirst({
            where: { transaksiID: Number(transaksiID) }
        })

        if (!findTransaksi) return response.json({
            status: false,
            message: `data transaksi not found`
        }).status(200)

        const dataTraksaksi = await prisma.transaksi.update({
            where: { transaksiID: Number(transaksiID) },
            data: {
                tanggal: tanggal || findTransaksi.tanggal,
                stanID: stanID || findTransaksi.stanID,
                siswaID: siswaID || findTransaksi.siswaID,
                status: status || findTransaksi.status
            },
            include: {
                stan_details: true,
                siswa_details: true,
                detail_transaksi: { include: { menu_details: true } }
            }
        })

        return response.json({
            status: true,
            data: dataTraksaksi,
            message: `transaksi has been update`
        }).status(200)
    } catch (error) {
        return response.json({
            status: false,
            message: `There is an error. ${error}`
        }).status(400)
    }
}

const deleteTransaksi = async (request: Request, response: Response): Promise<any> => {
    try {
        const transaksiID = request.params

        const findTransaksi = await prisma.transaksi.findFirst({
            where: { transaksiID: Number(transaksiID) }
        })

        if (!findTransaksi) return response.json({
            status: false,
            message: `transaksi not found`
        }).status(200)

        const dataTraksaksi = await prisma.transaksi.delete({
            where: { transaksiID: Number(transaksiID) }
        })

        return response.json({
            status: true,
            data: dataTraksaksi,
            message: `transaksi has been deleted`
        }).json(200)
    } catch (error) {
        return response.json({
            status: false,
            message: `There is an error. ${error}`
        }).status(400)
    }
}

export { createTransaksi, readTransaksi, updateTransaksi, deleteTransaksi }