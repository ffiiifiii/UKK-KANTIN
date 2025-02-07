import { NextFunction, Request, Response } from 'express'
import Joi from 'joi'

const addDataSchema = Joi.object({
    nama_stan : Joi.string().required(),
    nama_pemilik: Joi.string().required(),
    telp: Joi.string().required(),
    userID: Joi.number().min(1).required()
})

const updateDataSchema = Joi.object({
    nama_stan : Joi.string().required(),
    nama_pemilik: Joi.string().required(),
    telp: Joi.string().required(),
    userID: Joi.number().min(1).required()
})

export const verifyAddStan = (request: Request, response: Response, next: NextFunction) => {

    const {error} = addDataSchema.validate(request.body, {abortEarly: false})

    if (error) {
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}