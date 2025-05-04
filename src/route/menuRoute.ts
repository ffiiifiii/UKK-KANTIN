import express from "express"
import { creatMenu, deleteMenu, readMenu, updateMenu } from "../controller/menuController"
import { verifyToken } from "../middleware/Auth"


const app = express()

app.use(express.json())

app.post(`/menu`, [verifyToken], creatMenu)
app.get(`/menu`, [verifyToken], readMenu)
app.put(`/menu/:menuID`, [verifyToken], updateMenu)
app.delete(`/menu/:menuID`, [verifyToken], deleteMenu)

export default app
