import express from "express";
import { creatDiskon, deleteDiskon, readDiskon, updateDiskon } from "../controller/diskonController";
import { verifyToken } from "../middleware/Auth"

const app = express()

app.use(express.json())

app.post(`/diskon`, [verifyToken], creatDiskon)
app.get(`/diskon`, [verifyToken], readDiskon)
app.put(`/diskon/:diskonID`, [verifyToken], updateDiskon)
app.delete(`/diskon/:diskonID`, [verifyToken], deleteDiskon)

export default app