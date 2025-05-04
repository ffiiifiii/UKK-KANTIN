import express from "express"
import { creatSiswa, deleteSiswa, readSiswa, updateSiswa } from "../controller/siswaController"
import { verifyToken } from "../middleware/Auth";

const app = express()

app.use(express.json())

app.post(`/siswa`, [verifyToken], creatSiswa)
app.get(`/siswa`, [verifyToken], readSiswa)
app.put(`/siswa/:siswaID`, [verifyToken], updateSiswa)
app.delete(`/siswa/:siswaID`, [verifyToken], deleteSiswa)

export default app
