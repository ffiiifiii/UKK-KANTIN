import { PrismaClient } from "@prisma/client"
import { Request, Response } from "express"
import PDFDocument from 'pdfkit';
import fs from "fs"
import path from "path"

const prisma = new PrismaClient({ errorFormat: "pretty" })

const readTransaksi = async (request: Request, response: Response): Promise<any> => {
    try {
        const { search } = request.params

        const transaksi = await prisma.transaksi.findMany({
            where: {
                transaksiID: search ? Number(search) : undefined,
            },
            include: {
                stan_details: true,
                siswa_details: true,
                detail_transaksi: {
                    include: {
                        menu_details: true
                    }
                }
            }
        });


        const transaksiWithNota = transaksi.map((transaksi_details) => {
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

const historyTransaksiPerBulan = async (request: Request, response: Response): Promise<any> => {
    try {
        const userID = (request as any).user?.userID;

        if (!userID) {
            return response.status(401).json({
                status: false,
                message: "Unauthorized: userID tidak ditemukan dalam token"
            });
        }

        const siswa = await prisma.siswa.findFirst({ where: { userID: Number(userID) } });
        const admin_stan = await prisma.stan.findFirst({ where: { userID: Number(userID) } });

        let transaksiList = [];

        if (siswa) {
            transaksiList = await prisma.transaksi.findMany({
                where: { siswaID: siswa.siswaID },
                include: {
                    detail_transaksi: {
                        include: {
                            menu_details: true
                        }
                    },
                    stan_details: true,
                    siswa_details: true
                }

            });
        } else if (admin_stan) {
            transaksiList = await prisma.transaksi.findMany({
                where: { stanID: admin_stan.stanID },
                include: {
                    detail_transaksi: {
                        include: {
                            menu_details: true
                        }
                    },
                    stan_details: true,
                    siswa_details: true
                }

            });
        } else {
            return response.status(403).json({
                status: false,
                message: "User bukan siswa atau stan"
            });
        }

        const history: Record<string, any> = {};

        transaksiList.forEach(trx => {
            const date = new Date(trx.tanggal);
            const key = `${date.getMonth() + 1}-${date.getFullYear()}`;
            const total = trx.detail_transaksi.reduce((sum, item) => sum + item.harga_beli, 0);

            if (!history[key]) {
                history[key] = {
                    jumlah_transaksi: 0,
                    total_pemasukan: 0,
                    transaksi: []
                };
            }

            history[key].jumlah_transaksi += 1;
            history[key].total_pemasukan += total;
            history[key].transaksi.push({
                transaksiID: trx.transaksiID,
                tanggal: trx.tanggal,
                total_transaksi: total,
                nama_siswa: trx.siswa_details?.nama_siswa,
                nama_stan: trx.stan_details?.nama_stan,
                detail_transaksi: trx.detail_transaksi.map(detail => ({
                    detail_transaksiID: detail.detail_transaksiID,
                    menuID: detail.menuID,
                    nama_makanan: detail.menu_details?.nama_makanan,
                    qty: detail.qty,
                    harga_beli: detail.harga_beli
                }))
            });

        });

        return response.json({
            status: true,
            data: history,
            message: "Riwayat transaksi per bulan berhasil diambil"
        }).status(200);

    } catch (error) {
        return response.status(500).json({
            status: false,
            message: `There is an error. ${error}`
        });
    }
}

const generateNotaPDF = async (request: Request, response: Response): Promise<any> => {
    try {
        const { transaksiID } = request.params;

        const transaksi = await prisma.transaksi.findUnique({
            where: { transaksiID: Number(transaksiID) },
            include: {
                siswa_details: true,
                stan_details: true,
                detail_transaksi: { include: { menu_details: true } }
            }
        });

        if (!transaksi) {
            return response.status(404).json({
                status: false,
                message: "Transaksi tidak ditemukan"
            });
        }

        const pdfPath = path.join(__dirname, `nota_transaksi_${transaksiID}.pdf`);
        const doc = new PDFDocument({ margin: 50 });
        doc.pipe(fs.createWriteStream(pdfPath));

        doc.fontSize(16).text("NOTA TRANSAKSI", { align: "center", underline: true });
        doc.moveDown(1.5); // Jarak antara judul dan informasi

        doc.fontSize(10).text(`ID Transaksi: ${transaksi.transaksiID}`);
        doc.text(`Tanggal: ${new Date(transaksi.tanggal).toLocaleString()}`);
        doc.text(`Nama Siswa: ${transaksi.siswa_details.nama_siswa}`);
        doc.text(`Nama Stan: ${transaksi.stan_details.nama_stan}`);
        doc.moveDown(1.5); // Jarak sebelum tabel

        doc.font("Helvetica-Bold").fontSize(11).text("DAFTAR MAKANAN", { align: "center", underline: true });
        doc.moveDown(0.8);


        const startX = 100;
        const columnWidths = [30, 200, 50, 100]; // No | Nama | Qty | Harga
        const headers = ["No", "Nama Makanan", "Qty", "Harga"];


        const tableTop = doc.y;
        headers.forEach((header, i) => {
            doc.text(header, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), tableTop, {
                width: columnWidths[i],
                align: "center"
            });
        });

        doc.moveTo(startX, tableTop + 15).lineTo(startX + columnWidths.reduce((a, b) => a + b), tableTop + 15).stroke();

        let y = tableTop + 25;
        let grandTotal = 0;
        let totalDiskon = 0;

        transaksi.detail_transaksi.forEach((detail, index) => {
            const menu = detail.menu_details;
            const qty = detail.qty;
            const hargaAsli = menu.harga;
            const hargaSatuan = detail.harga_beli / qty;
            const subtotal = detail.harga_beli;
            const diskonPerItem = hargaAsli - hargaSatuan;
            const totalDiskonItem = diskonPerItem * qty;

            const row = [
                `${index + 1}`,
                menu.nama_makanan,
                qty.toString(),
                `Rp ${hargaAsli.toLocaleString()}`
            ];


            row.forEach((text, i) => {
                doc.text(text, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), y, {
                    width: columnWidths[i],
                    align: "center"
                });
            });

            y += 20;
            grandTotal += subtotal;
            totalDiskon += totalDiskonItem;
        });

        // Setelah loop transaksi.detail_transaksi
        doc.moveTo(startX, y).lineTo(startX + columnWidths.reduce((a, b) => a + b), y).stroke();
        y += 10;

        // Menampilkan total dengan rata kanan
        doc.font("Helvetica-Bold");
        const rightAlignX = startX + columnWidths.reduce((a, b) => a + b) - 200;

        doc.text(`Total Diskon: Rp ${totalDiskon.toLocaleString()}`, rightAlignX, y, { align: "right", width: 200 });
        doc.text(`Total Bayar : Rp ${grandTotal.toLocaleString()}`, rightAlignX, y + 15, { align: "right", width: 200 });

        doc.font("Helvetica");

        doc.moveDown(3); // Menjaga spasi akhir
        doc.font("Helvetica").fontSize(10).text("Terima kasih telah melakukan transaksi.", { align: "center" });
        doc.text("Selamat menikmati makanan Anda!", { align: "center" });


        doc.end();

        return response.status(200).json({
            status: true,
            message: "Nota transaksi berhasil dibuat",
            pdfPath
        });

    } catch (error) {
        return response.status(500).json({
            status: false,
            message: `There is an error. ${error}`
        });
    }
}

const createTransaksi = async (request: Request, response: Response): Promise<any> => {
    const { items } = request.body;
    const userID = (request as any).user?.userID;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return response.json({
            status: false,
            message: "Daftar pesanan tidak boleh kosong",
        }).status(400)
    }

    try {
        // Cari siswa berdasarkan userID
        const siswaData = await prisma.siswa.findFirst({
            where: { userID: Number(userID) }
        });

        if (!siswaData) {
            return response.json({
                status: false,
                message: "Siswa tidak ditemukan",
            }).status(404)
        }

        const menuIDs = items.map((item: any) => item.menuID);
        const menus = await prisma.menu.findMany({
            where: { menuID: { in: menuIDs } },
            include: {
                menu_diskon: {
                    include: { diskon_details: true }
                },
                stan_details: true
            }
        });

        const stanSet = new Set(menus.map(menu => menu.stanID));
        if (stanSet.size > 1) {
            return response.json({
                status: false,
                message: "Semua menu harus berasal dari satu stan",
            }).status(400)
        }

        const stanID = [...stanSet][0];
        const nama_stan = menus[0].stan_details?.nama_stan || "Tidak diketahui";

        // Simpan transaksi utama
        const transaksi = await prisma.transaksi.create({
            data: {
                tanggal: new Date().toISOString(),
                stanID,
                siswaID: siswaData.siswaID,
                status: "belumdikonfirm"
            }
        });

        let total = 0;
        const detailOutput: any[] = [];

        for (const item of items) {
            const menu = menus.find(m => m.menuID === item.menuID);
            if (!menu) continue;

            let hargaFinal = menu.harga;
            let isDiskon = true;
            let namaDiskon: string | null = null;

            const menuDiskon = menu.menu_diskon[0]?.diskon_details;
            const now = new Date();

            if (menuDiskon && new Date(menuDiskon.tanggal_awal) <= now && new Date(menuDiskon.tanggal_akhir) >= now) {
                hargaFinal = Math.round(menu.harga * (1 - menuDiskon.presentase_diskon));
                isDiskon = true;
                namaDiskon = menuDiskon.nama_diskon;
            }

            const subtotal = hargaFinal * item.qty;
            total += subtotal;

            await prisma.detail_transaksi.create({
                data: {
                    transaksiID: transaksi.transaksiID,
                    menuID: item.menuID,
                    qty: item.qty,
                    harga_beli: subtotal
                }
            });

            detailOutput.push({
                nama_menu: menu.nama_makanan,
                harga_satuan: hargaFinal,
                qty: item.qty,
                subtotal,
                diskon_aktif: isDiskon,
                nama_diskon: namaDiskon
            });
        }

        return response.json({
            id_transaksi: transaksi.transaksiID,
            tanggal: transaksi.tanggal,
            status: transaksi.status,
            total,
            nama_stan,
            nama_siswa: siswaData.nama_siswa,
            detail: detailOutput,
            message: "Transaksi has been created",
        }).status(200)

    } catch (error) {
        return response.json({
            status: false,
            message: `There is an error. ${error}`
        }).status(500)
    }
}


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
        const { transaksiID } = request.params;
        const userID = (request as any).user?.userID;

        if (!userID) {
            return response.status(401).json({
                status: false,
                message: "Unauthorized: userID tidak ditemukan dalam token"
            });
        }

        // Cek apakah user adalah admin stan
        const adminStan = await prisma.stan.findFirst({
            where: { userID: Number(userID) }
        });

        if (!adminStan) {
            return response.status(403).json({
                status: false,
                message: "Akses ditolak: hanya admin stan yang bisa menghapus transaksi"
            });
        }

        const transaksi = await prisma.transaksi.findUnique({
            where: {
                transaksiID: Number(transaksiID)
            }
        });

        if (!transaksi) {
            return response.status(404).json({
                status: false,
                message: "Transaksi tidak ditemukan"
            });
        }

        // Pastikan hanya admin stan yang sesuai yang bisa menghapus transaksi
        if (transaksi.stanID !== adminStan.stanID) {
            return response.status(403).json({
                status: false,
                message: "Akses ditolak: Anda tidak memiliki hak untuk menghapus transaksi ini"
            });
        }

        // Hapus detail transaksi terlebih dahulu (jika diperlukan oleh database constraint)
        await prisma.detail_transaksi.deleteMany({
            where: {
                transaksiID: Number(transaksiID)
            }
        });

        const deletedTransaksi = await prisma.transaksi.delete({
            where: {
                transaksiID: Number(transaksiID)
            }
        });

        return response.status(200).json({
            status: true,
            data: deletedTransaksi,
            message: "Transaksi berhasil dihapus"
        });

    } catch (error) {
        return response.status(500).json({
            status: false,
            message: `Terjadi kesalahan: ${error}`
        });
    }
}

export { createTransaksi, readTransaksi, updateTransaksi, deleteTransaksi, generateNotaPDF, historyTransaksiPerBulan }