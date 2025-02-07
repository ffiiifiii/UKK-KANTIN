import  express  from "express";
import { verifyUser } from "../middleware/verifyUser";
import { createUsers, deleteUser, login, readUser, updateUser } from "../controller/usersController";

const app = express()

app.use(express.json())

app.post(`/user`, createUsers)
app.get(`/user`, readUser)
app.put(`/user/:userID`, updateUser)
app.delete(`/user/:userID`, deleteUser)
app.post(`/user/login`, login)

export default app