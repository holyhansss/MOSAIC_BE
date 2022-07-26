import express from "express";
 
import { 
    get_category_data_1yr,
    get_category_data_1mo,
    get_category_data_1d
    
} from "../coin_categories/Queries.js";
 
const router = express.Router();
 
router.get('/category/1yr', get_category_data_1yr);
router.get('/category/1mo', get_category_data_1mo);
router.get('/category/1d', get_category_data_1d);
 
export default router;