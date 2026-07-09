import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRoutes } from './boardRoutes.js'

const Router = express.Router()

// Check API status
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({
    message: 'APIs are ready to use'
  })
})

// APIs for board
Router.use('/boards', boardRoutes)

export const v1Router = Router
