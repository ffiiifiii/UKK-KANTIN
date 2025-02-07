import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

const verifyUser = async (request: Request, response: Response, next: NextFunction): Promise<any> => {
    try {
        const header = request.headers.authorization
        const token = header?.split(" ")[1] || ""
        const secretkey = "kantin"

        verify(token, secretkey, error => {
            if (error) {
                return response.status(401).json({
                    status: false,
                    message: `unauthorized`
                })
            }
            next()
        })

    } catch (error) {
        return response.status(500).json({
            status: false,
            message: `tidak berhasil`
        })
    }
}

export { verifyUser }