import express from "express";
 
import { 
    get_category_data
} from "../coin_categories/Queries.js";
 
const router = express.Router();
 
router.get('/category', get_category_data);
 
export default router;