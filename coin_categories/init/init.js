import {createAndInsertCoinDeskCoinsList, sortCoindeskList} from "./coindesk_coins_list.js"
import {initializeCategoryDb} from "./categories_coins_list.js"
import {allCategoryCoinsPricesDaily, allCategoryCoinsPricesHourly} from "./all_category_prices.js"


const Init = async () => {
    await createAndInsertCoinDeskCoinsList ();
    await sortCoindeskList() ;
    await initializeCategoryDb() ;
    await allCategoryCoinsPricesDaily();
    await allCategoryCoinsPricesHourly();
}

Init();