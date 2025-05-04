import { PrismaClient } from "@prisma/client" //mengakses database lewat prisma
import { Request, Response } from "express"

//tampilan error agar lebih mudah terbaca
const prisma = new PrismaClient({ errorFormat: "pretty" })

const creatDiskon = async (request: Request, response: Response): Promise<any> => {
    try {
        //mengambil data 
        const { nama_diskon, presentase_diskon, tanggal_awal, tanggal_akhir, stanID } = request.body;
        const userID = (request as any).user?.userID;

        //hanya admin yang bisa mengakses create diskon
        const admin_stan = await prisma.stan.findFirst({
            where: { userID: Number(userID) }
        });

        if (!admin_stan) {
            return response.status(403).json({
                status: false,
                message: "Unauthorized: hanya admin stan yang dapat membuat diskon"
            });
        }

        // Pastikan stanID valid dan bertipe angka
        const stanIDNumber = Number(stanID);

        if (isNaN(stanIDNumber)) {
            return response.status(400).json({
                status: false,
                message: "stanID tidak valid"
            });
        }

        // Hitung jumlah diskon yang sudah dimiliki stan ini
        const jumlahDiskon = await prisma.diskon.count({
            where: { stanID: stanIDNumber }
        });

        if (jumlahDiskon >= 2) {
            return response.status(400).json({
                status: false,
                message: "Diskon maksimal hanya 2 untuk setiap stan"
            });
        }

        const newData = await prisma.diskon.create({
            data: {
                nama_diskon,
                presentase_diskon,
                tanggal_awal,
                tanggal_akhir,
                stanID: stanIDNumber
            }
        });

        return response.status(200).json({
            status: true,
            data: newData,
            message: `Diskon berhasil dibuat`
        });

    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `Terjadi kesalahan. ${error}`
        });
    }
}

const readDiskon = async (request: Request, response: Response): Promise<any> => {
    try {
        const userID = (request as any).user?.userID;

        //hanya admin yang bisa mengakses create diskon
        const admin_stan = await prisma.stan.findFirst({
            where: { userID: Number(userID) }
        });

        if (!admin_stan) {
            return response.status(403).json({
                status: false,
                message: "Unauthorized: hanya admin stan yang dapat membuat diskon"
            });
        }

        //searching
        const { search } = request.query

        //mencari diskon yang cocok
        const dataDiskon = await prisma.diskon.findMany({
            where: {
                nama_diskon: { contains: search?.toString() || "" }
            },
            include: {
                stan_detail: true,
                menu_diskon: {
                    include: {
                        diskon_details: true
                    }
                }
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
        const userID = (request as any).user?.userID;
        const admin_stan = await prisma.stan.findFirst({ where: { userID: Number(userID) } });

        const { diskonID } = request.params
        const { nama_diskon, presentase_diskon, tanggal_awal, tanggal_akhir, stanID } = request.body


        const findDiskon = await prisma.diskon.findFirst({
            where: {
                diskonID: Number(diskonID),
                stanID: admin_stan?.stanID
            }
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
                menu_diskon: {
                    include: {
                        diskon_details: true
                    }
                }
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
        const userID = (request as any).user?.userID;
        const admin_stan = await prisma.stan.findFirst({ where: { userID: Number(userID) } });

        const { diskonID } = request.params

        const findDiskon = await prisma.diskon.findFirst({
            where: {
                diskonID: Number(diskonID),
                stanID: admin_stan?.stanID
            }
        })

        if (!findDiskon) return response.status(200).json({
            status: false,
            message: `diskon not found`
        })


        const dataDiskon = await prisma.diskon.delete({
            where: {
                diskonID: Number(diskonID)
            }
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