import  express from "express"
import { creatSiswa, deleteSiswa, readSiswa, updateSiswa } from "../controller/siswaController"

const app = express()

app.use(express.json())

app.post(`/siswa`, creatSiswa)
app.get(`/siswa`, readSiswa)
app.put(`/siswa/:siswaID`, updateSiswa)
app.delete(`/siswa/:siswaID`, deleteSiswa)

export default app
