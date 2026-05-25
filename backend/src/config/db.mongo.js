import { MongoClient } from 'mongodb'
import 'dotenv/config'

const client = new MongoClient(process.env.MONGODB_URI)

export const connectMongo = async () => await client.connect()
export const getMongo = () => client.db('granja_analytics')

export default client
