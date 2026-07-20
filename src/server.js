/* eslint-disable no-console */
import express from 'express'
import { connectToDatabase, closeDatabaseConnection } from './config/mongodb.js'
import exitHook from 'async-exit-hook'
import { env } from './config/environment.js'
import { v1Router } from './routes/v1/index.js'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware.js'
import cors from 'cors'
import { corsOptions } from './config/cors.js'
import cookieParser from 'cookie-parser'
import http from 'http'
import socketIo from 'socket.io'
import { inviteUserToBoardSocket } from '~/sockets/inviteUserToBoardSocket.js'

const startServer = () => {
  const app = express()

  // Fix Cache from disk cua ExpressJS
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  // Cau hinh Cookie Parser
  app.use(cookieParser())

  // Middleware để xử lý CORS
  app.use(cors(corsOptions))

  // Middleware để parse JSON body từ request
  app.use(express.json())

  app.use('/v1', v1Router)

  // Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  // create a new server wrap express app to use socket.io
  const server = http.createServer(app)
  // config socket.io
  const io = socketIo(server, { cors: corsOptions })
  io.on('connection', (socket) => {
    inviteUserToBoardSocket(socket)
  })


  if (env.BUILD_MODE === 'production') {
    // production environment
    server.listen(process.env.PORT, () => {
      console.log(`Server is running at ${process.env.PORT}`)
    })
  } else {
    // dev environment
    server.listen(env.APP_PORT, env.APP_HOST, () => {
      console.log(`Server is running at ${env.APP_HOST}:${env.APP_PORT}`)
    })
  }

  /**
   * Đóng kết nối database khi dừng server
   * exitHook: Thư viện giúp xử lý các sự kiện khi ứng dụng Node.js thoát
   * Khi ứng dụng Node.js thoát, exitHook sẽ gọi hàm closeDatabaseConnection để đóng kết nối MongoDB
   */
  exitHook(() => {
    closeDatabaseConnection()
  })
};

// chi khi ket noi duoc database thi moi start server
// IIFE
(async () => {
  try {
    await connectToDatabase()
    console.log('Connected to MongoDB')

    // Khoi tao server sau khi ket noi duoc database
    startServer()
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    /**
     * process.exit(0): Thoat app voi status code 0, khong co loi
     * process.exit(1): Thoat app voi status code 1, co loi
     */
    process.exit(0)
  }
})()
