import {createAndInsertCoinDeskCoinsList} from "./coindesk_coins_list.js"
import {initializeCategoryDb} from "./categories_coins_list.js"
import {allCategoryCoinsPricesDaily, allCategoryCoinsPricesHourly} from "./all_category_prices.js"

const Init = async () => {
    console.log("area1");
    await createAndInsertCoinDeskCoinsList ();
    console.log("area2");
    await initializeCategoryDb() ;
    console.log("area3");
    await allCategoryCoinsPricesDaily();
    console.log("area4");
    await allCategoryCoinsPricesHourly();
    console.log("area5");
}

Init();