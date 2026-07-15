import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRoutes } from './boardRoutes.js'
import { columnRoutes } from './columnRoutes.js'
import { cardRoutes } from './cardRoutes.js'
import { userRoutes } from './userRoutes.js'

const Router = express.Router()

// Check API status
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({
    message: 'APIs are ready to use'
  })
})

// APIs for board
Router.use('/boards', boardRoutes)

// APIs for column
Router.use('/columns', columnRoutes)

// APIs for card
Router.use('/cards', cardRoutes)

// APIs for user
Router.use('/users', userRoutes)

export const v1Router = Router
