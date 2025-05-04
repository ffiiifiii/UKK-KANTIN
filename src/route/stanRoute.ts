import express from "express";
import { createStan, deleteStan, readStan, updateStan } from "../controller/stanController";
import { verifyToken } from "../middleware/Auth";

const app = express()

app.use(express.json())

app.post(`/stan`, [verifyToken], createStan)
app.get(`/stan`, [verifyToken], readStan)
app.put(`/stan/:stanID`, [verifyToken], updateStan)
app.delete(`/stan/:stanID`, [verifyToken], deleteStan)

export default app