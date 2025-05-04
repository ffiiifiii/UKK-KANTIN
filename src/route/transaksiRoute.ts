import express from "express";
//impor semua handler transaksi controller
import { createTransaksi, deleteTransaksi, historyTransaksiPerBulan, generateNotaPDF, readTransaksi, updateTransaksi } from "../controller/transaksiController";
import { verifyToken } from "../middleware/Auth";

const app = express()

app.use(express.json())

app.post(`/transaksi`, [verifyToken], createTransaksi)
app.get(`/transaksi`, [verifyToken], readTransaksi)
app.get(`/notaTransaksi/:transaksiID`, [verifyToken], generateNotaPDF)
app.get("/historyTransaksi", [verifyToken], historyTransaksiPerBulan);
app.put(`/transaksi/:transaksiID`, [verifyToken], updateTransaksi)
app.delete(`/transaksi/:transaksiID`, [verifyToken], deleteTransaksi)

export default app