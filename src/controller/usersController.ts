import { PrismaClient } from "@prisma/client"
import { Request, Response } from "express"
import md5 from "md5"
import { sign } from "jsonwebtoken"

const prisma = new PrismaClient({ errorFormat: "pretty" })


const createUsers = async (request: Request, response: Response): Promise<any> => {
    try {
        const { username, password, role, nama } = request.body

        const newData = await prisma.users.create({
            data: {
                username,
                password: md5(password),
                role,
                nama
            }
        })

        return response.json({
            status: true,
            data: newData,
            message: `user has been created`
        }).status(200)
    } catch (error) {
        return response.json({
            status: false,
            message: `There is an error. ${error}`
        }).status(400)
    }
}

const readUser = async (request: Request, response: Response): Promise<any> => {
    try {
        const { search } = request.query
        const allUser = await prisma.users.findMany({
            where: {
                username: {
                    contains: search?.toString() || ""
                }
            }
        })

        return response.json({
            status: true,
            data: allUser,
            message: `data has retrieved`
        }).status(200)
    } catch (error) {
        return response.json({
            status: false,
            message: `There is an error. ${error}`
        }).status(400)
    }
}

const updateUser = async (request: Request, response: Response): Promise<any> => {
    try {
        const { userID } = request.params
        const { username, password, role, nama } = request.body

        const findUser = await prisma.users.findFirst({
            where: {
                userID: Number(userID)
            }
        })

        if (!findUser) return response.status(400).json({
            status: false,
            message: `data user not found`
        })


        const dataUser = await prisma.users.update({
            where: { userID: Number(userID) },
            data: {
                username: username || findUser.username,
                password: password ? md5(password) : findUser.password,
                role: role || findUser.role,
                nama: nama || findUser.nama
            }
        })

        return response.json({
            status: true,
            message: `user has been update`,
            data: dataUser
        }).status(200)
    } catch (error) {
        return response.json({
            status: false,
            message: `There is an error. ${error}`
        }).status(400)
    }
}

const deleteUser = async (request: Request, response: Response): Promise<any> => {
    try {
        const { userID } = request.params

        const findUser = await prisma.users.findFirst({
            where: {
                userID: Number(userID)
            }
        })

        if (!findUser) return response.status(200).json({
            status: false,
            message: `user not found`
        })


        const dataUser = await prisma.users.delete({
            where: {
                userID: Number(userID)
            }
        })

        return response.json({
            status: true,
            message: `data has been delete`,
            data: dataUser
        }).status(200)
    } catch (error) {
        return response.json({
            status: false,
            message: `There is an error. ${error}`
        }).status(400)
    }
}

const login = async (request: Request, response: Response): Promise<any> => {
    try {
        const { username, password } = request.body

        const findUser = await prisma.users.findFirst({
            where: {
                username,
                password: md5(password)
            }
        })

        if (!findUser) return response.json({
            status: false,
            logged: false,
            message: `email or password is not found`
        }).status(200)

        let payload = JSON.stringify(findUser)

        let secretkey = process.env.JWT_SECRET_KEY

        let token = sign(payload, secretkey || "sipp")

        return response.status(200).json({
            status: true,
            logged: true,
            message: `login berhasil`,
            token
        })
    } catch (error) {
        return response.json({
            status: false,
            message: `There is an error. ${error}`
        }).status(400)
    }
}
export { createUsers, readUser, updateUser, deleteUser, login }