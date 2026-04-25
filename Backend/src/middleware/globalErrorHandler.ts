import { type NextFunction, type Request, type Response } from 'express'
import { type THttpErrror } from '../types/types'

export default (err: THttpErrror, _: Request, res: Response, __: NextFunction) => {
    res.status(err.statusCode).json(err)
}
