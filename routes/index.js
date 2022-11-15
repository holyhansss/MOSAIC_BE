import express from "express";
 
import { 
    get_category_data_1yr,
    get_category_data_1mo,
    get_category_data_6mo,
    
} from "../coin_categories/queries/Queries.js";

import { 
    get_snpcmc_data_1d,
    get_snpcmc_data_1mo,
    get_snpcmc_data_1yr
    
} from "../snp_cmc/control.js";


 
const router = express.Router();
 
router.get('/category/1yr', get_category_data_1yr);
router.get('/category/1mo', get_category_data_1mo);
router.get('/category/6mo', get_category_data_6mo);

// router.get('/category/1d', get_category_data_1d);
router.get('/snpcmc/1d', get_snpcmc_data_1d);
router.get('/snpcmc/1mo', get_snpcmc_data_1mo); //Select 해서 가져오기
router.get('/snpcmc/1yr', get_snpcmc_data_1yr);
 
export default router;