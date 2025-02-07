import  express  from "express";
import { creatDiskon, deleteDiskon, readDiskon, updateDiskon } from "../controller/diskonController";

const app = express()

app.use(express.json())

app.post(`/diskon`, creatDiskon)
app.get(`/diskon`, readDiskon)
app.put(`/diskon/:diskonID`, updateDiskon)
app.delete(`/diskon/:diskonID`, deleteDiskon)

export default app