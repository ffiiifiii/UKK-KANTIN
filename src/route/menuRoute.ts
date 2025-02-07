import  express from "express"
import { creatMenu, deleteMenu, readMenu, updateMenu } from "../controller/menuController"


const app = express()

app.use(express.json())

app.post(`/menu`, creatMenu)
app.get(`/menu`, readMenu)
app.put(`/menu/:menuID`, updateMenu)
app.delete(`/menu/:menuID`, deleteMenu)

export default app
