import express from "express";
import {MY_HOST, MY_USERNAME, MY_PASSWORD, MY_DATABASE} from "./config/database.js";
// import db from "./config/database.js";
import productRoutes from "./routes/index.js";
import cors from "cors";
import mysql from 'mysql2/promise';
 
const app = express();
 
// try {
//     const connection = await mysql.createConnection
//     ({
//         host: MY_HOST,
//         user: MY_USERNAME,
//         password: MY_PASSWORD,
//         database : MY_DATABASE,
//     });
//     await connection.authenticate();
//     console.log('Database connected...');
// } catch (error) {
//     console.error('Connection error:', error);
// }
 
app.use(cors());
app.use(express.json());
app.use('/market', productRoutes);
 
app.listen(5000, () => console.log('Server running at port 5000'));