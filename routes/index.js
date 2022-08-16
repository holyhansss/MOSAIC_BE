import express from "express";
 
import { 
    get_category_data_1yr,
    get_category_data_1mo,
    get_category_data_1d,
    
<<<<<<< HEAD
} from "../coin_categories/Queries.js";

import { 
    get_snpcmc_data_1d,
    get_snpcmc_data_1mo,
    get_snpcmc_data_1yr
    
} from "../snp_cmc/control.js";
=======
} from "../coin_categories/queries/Queries.js";
>>>>>>> 9b978e963c1c0f5ce8f36c1b70d6536a5de5529d
 
const router = express.Router();
 
router.get('/category/1yr', get_category_data_1yr);
router.get('/category/1mo', get_category_data_1mo);
router.get('/category/1d', get_category_data_1d);
router.get('/snpcmc/1d', get_snpcmc_data_1d);
router.get('/snpcmc/1mo', get_snpcmc_data_1mo); //Select 해서 가져오기
router.get('/snpcmc/1yr', get_snpcmc_data_1yr);
 
export default router;