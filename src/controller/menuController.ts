import { PrismaClient } from "@prisma/client"
import express, { Request, Response } from "express"
import upload from "./uploadImage"

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

const creatMenu = async (request: Request, response: Response): Promise<any> => {
    upload.single('foto')(request, response, async (error) => {
        try {
            const userID = (request as any).user?.userID;

            const admin_stan = await prisma.stan.findFirst({
                where: { userID: Number(userID) }
            });

            if (!admin_stan) {
                return response.status(403).json({
                    status: false,
                    message: "Unauthorized: hanya admin stan yang dapat membuat menu"
                });
            }

            const { nama_makanan, harga, jenis, deskripsi, stanID } = request.body
            const foto = request.file ? request.file.filename : null


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
        const userID = (request as any).user?.userID;

        if (!userID) {
            return response.status(401).json({
                status: false,
                message: "Unauthorized: userID tidak ditemukan dalam token"
            });
        }

        const { search } = request.query;

        const admin_stan = await prisma.stan.findFirst({
            where: { userID: Number(userID) }
        });

        const siswa = await prisma.siswa.findFirst({
            where: { userID: Number(userID) }
        });

        let whereClause: any = {
            nama_makanan: {
                contains: search?.toString() || ""
            }
        };

        // Jika admin stan, filter hanya menu dari stan-nya
        if (admin_stan) {
            whereClause.stanID = admin_stan.stanID;

        } else if (!siswa) {
            return response.status(403).json({
                status: false,
                message: "Unauthorized: user bukan admin stan atau siswa"
            });
        }

        const menuList = await prisma.menu.findMany({
            where: whereClause,
            include: {
                stan_details: true,
                detail_transaksi: {
                    include: {
                        menu_details: true
                    }
                },
                menu_diskon: {
                    include: {
                        diskon_details: true
                    }
                }
            },
        });

        return response.status(200).json({
            status: true,
            data: menuList,
            message: `Menu has been retrieved`
        });

    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `There is an error. ${error}`
        });
    }
}

const updateMenu = async (request: Request, response: Response): Promise<any> => {
    upload.single('foto')(request, response, async (error) => {
        try {
            const userID = (request as any).user?.userID;
            const admin_stan = await prisma.stan.findFirst({ where: { userID: Number(userID) } });

            const { menuID } = request.params;
            const { nama_makanan, harga, jenis, deskripsi } = request.body;
            const foto = request.file ? request.file.filename : null;

            const findMenu = await prisma.menu.findFirst({
                where: {
                    menuID: Number(menuID),
                    stanID: admin_stan?.stanID
                }
            });

            if (!findMenu)
                return response.status(403).json({
                    status: false,
                    message: `Menu not found or access denied`
                });

            const dataMenu = await prisma.menu.update({
                where: { menuID: Number(menuID) },
                data: {
                    nama_makanan: nama_makanan || findMenu.nama_makanan,
                    harga: harga ? Number(harga) : findMenu.harga,
                    jenis: jenis || findMenu.jenis,
                    deskripsi: deskripsi || findMenu.deskripsi,
                    foto: foto || findMenu.foto
                },
                include: {
                    stan_details: true,
                    detail_transaksi: {
                        include: {
                            transaksi_details: true
                        }
                    },
                    menu_diskon: {
                        include: {
                            diskon_details: true
                        }
                    }
                },
            });

            return response.status(200).json({
                status: true,
                data: dataMenu,
                message: `Menu has been updated`
            });

        } catch (error) {
            return response.status(400).json({
                status: false,
                message: error
            });
        }
    });
}

const deleteMenu = async (request: Request, response: Response): Promise<any> => {
    try {
        const userID = (request as any).user?.userID;
        const admin_stan = await prisma.stan.findFirst({ where: { userID: Number(userID) } });

        const { menuID } = request.params;

        const findMenu = await prisma.menu.findFirst({
            where: {
                menuID: Number(menuID),
                stanID: admin_stan?.stanID
            }
        });

        if (!findMenu) return response.status(403).json({
            status: false,
            message: `Menu not found or access denied`
        });

        const dataMenu = await prisma.menu.delete({
            where: { menuID: Number(menuID) }
        });

        return response.status(200).json({
            status: true,
            data: dataMenu,
            message: `Menu has been deleted`
        });

    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `There is an error. ${error}`
        });
    }
}

export { creatMenu, readMenu, updateMenu, deleteMenu }