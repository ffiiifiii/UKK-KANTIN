import  express  from "express";
import { createStan, deleteStan, readStan, updateStan } from "../controller/stanController";

const app = express()

app.use(express.json())

app.post(`/stan`, createStan)
app.get(`/stan`, readStan)
app.put(`/stan/:stanID`, updateStan)
app.delete(`/stan/:stanID`, deleteStan)

export default app