import express from "express";
import {MY_HOST, MY_USERNAME, MY_PASSWORD, MY_DATABASE} from "./config/database.js";
// import db from "./config/database.js";
import productRoutes from "./routes/index.js";
import cors from "cors";
import mysql from 'mysql2/promise';
 
const app = express();

app.use(cors());
app.use(express.json());
app.use('/market', productRoutes);
 
app.listen(5000, () => console.log('Server running at port 5000'));