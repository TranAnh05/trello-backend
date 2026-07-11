import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from './environment.js'

let trelloDatabaseInstance = null

// Khởi tạo một đối tượng client để kết nối với MongoDB
const mongoClient = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

// Hàm kết nối đến cơ sở dữ liệu MongoDB
export const connectToDatabase = async () => {
  await mongoClient.connect()

  // Kết nối thành công thì gán giá trị của biến trelloDatabaseInstance bằng đối tượng cơ sở dữ liệu
  trelloDatabaseInstance = mongoClient.db(env.DATABASE_NAME)
}

// Hàm lấy đối tượng cơ sở dữ liệu MongoDB
export const getDatabaseInstance = () => {
  if (!trelloDatabaseInstance)
    throw new Error('Must connect to database first!')
  return trelloDatabaseInstance
}


// Đóng kết nối MongoDB khi ứng dụng thoát
export const closeDatabaseConnection = async () => {
  await mongoClient.close()
}