import {createAndInsertCoinDeskCoinsList} from "./coindesk_coins_list.js"
import {initializeCategoryDb} from "./categories_coins_list.js"
import {allCategoryCoinsPricesDaily, allCategoryCoinsPricesHourly} from "./all_category_prices.js"
import {InitGraphData} from "./graph_data_categories.js"




const Init = async () => {
    //initialize all

    console.log("area1");
    // await createAndInsertCoinDeskCoinsList();
    console.log("area2");
    // await initializeCategoryDb();
    console.log("area3");
    // // await allCategoryCoinsPricesDaily();
    console.log("area4");
    // await allCategoryCoinsPricesHourly();
    console.log("area5");
    await InitGraphData();
    console.log("area6");
}

Init()