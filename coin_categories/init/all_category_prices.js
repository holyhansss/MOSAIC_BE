import {create_category_history_daily} from '../queries/queries_init.js'
import {insert_dates} from '../queries/queries.js'
import {getToday} from '../date_formatter.js'

let categories = 
[
    "Currency",                 
    "Smart Contract Platform",
    "Computing",
    "DeFi", 
    "Culture & Entertainment"
]

const allCategoryCoinsPrices = async () => {
    for (let i=0; i<categories.length; i++){
        await create_category_history_daily(categories[i]);
        let categoryTableName = category[i] + "_prices";
        let endDate = getToday();
        let startDate = get_364days_before();
        await insert_dates(categoryTableName, "Date", startDate, endDate);
    }
    
}

