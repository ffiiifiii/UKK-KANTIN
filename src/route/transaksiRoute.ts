import  express  from "express";
import { createTransaksi, deleteTransaksi, readTransaksi, updateTransaksi } from "../controller/transaksiController";

const app = express()

app.use(express.json())

app.post(`/transaksi`, createTransaksi)
app.get(`/transaksi`, readTransaksi)
app.put(`/transaksi/:transaksiID`, updateTransaksi)
app.delete(`/transaksi/:transaksiID`, deleteTransaksi)

export default app