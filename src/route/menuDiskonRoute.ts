import express from "express";
import { createMenuDiskon, deleteMenuDiskon, readMenuDiskon, updateMenuDiskon } from "../controller/menuDiskonController";
import { verifyToken } from "../middleware/Auth"

const app = express()

app.use(express.json())

app.post(`/menuDiskon`, [verifyToken], createMenuDiskon)
app.get(`/menuDiskon`, [verifyToken], readMenuDiskon)
app.put(`/menuDiskon/:menu_diskonID`, [verifyToken], updateMenuDiskon)
app.delete(`/menuDiskon/:menu_diskonID`, [verifyToken], deleteMenuDiskon)

export default app