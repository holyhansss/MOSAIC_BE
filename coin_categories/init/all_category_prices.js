import {create_category_history_daily_or_hourly, 
        insert_dates, 
        insert_time_data_hourly, 
        insert_category_history_daily, 
        insert_category_history_hourly
    } from '../queries/queries_init.js'
// import {} from '../queries/queries.js'
import {getToday} from '../date_formatter.js'

let categories = 
[
    "Currency",                 
    "Smart Contract Platform",
    "Computing",
    "DeFi", 
    "Culture & Entertainment"
]

const allCategoryCoinsPricesDaily = async () => {
    for (let i=0; i<categories.length; i++){
        const currCategory = category[i];
        try {
            const returnTrue = await create_category_history_daily_or_hourly(currCategory, "daily");
            if (returnTrue != true){
                console.error("create_category_history_daily_or_hourly() failed: return value not true");
                return false;
            }
        } catch (error) {
            console.error(error);
            console.error("create_category_history_daily_or_hourly() failed");          
            return false;  
        }
        let categoryTableName = category[i] + "_prices";
        let endDate = getToday();
        let startDate = get_364days_before();
        
        try {
            const returnTrue = await insert_dates(categoryTableName, "Date", startDate, endDate);
            if (returnTrue != true){
                console.error("insert_dates() failed: return value not true");
                return false;
            }
        } catch (error) {
            console.error(error);
            console.error("insert_dates() failed");           
            return false; 
        }
        try {
            const returnTrue = await insert_category_history_daily(currCategory);
            if (returnTrue != true){
                console.error("insert_category_history_daily() failed: return value not true");
                return false;
            }
        } catch (error) {
            console.error(error);
            console.error("insert_category_history_daily() failed");           
            return false; 
        }
    }   
}

const allCategoryCoinsPricesHourly = async () => {
    for (let i=0; i<categories.length; i++){
        const currCategory = category[i];
        try {
            const returnTrue = await create_category_history_daily_or_hourly(currCategory, "hourly");
            if (returnTrue != true){
                console.error("create_category_history_daily_or_hourly() failed: return value not true");
                return false;
            }
        } catch (error) {
            console.error(error);
            console.error("create_category_history_daily_or_hourly() failed");           
            return false; 
        }
        let categoryTableName = category[i] + "_prices_hourly";
        let endDate = getToday();
        let startDate = get_364days_before();

        try {
            const returnTrue = await insert_time_data_hourly(currCategory);
            if (returnTrue != true){
                console.error("insert_time_data_hourly() failed: return value not true");
                return false;
            }
        } catch (error) {
            console.error(error);
            console.error("insert_time_data_hourly() failed");           
            return false; 
        }

        try {
            const returnTrue = await insert_category_history_hourly(currCategory);
            if (returnTrue != true){
                console.error("insert_category_history_hourly() failed: return value not true");
                return false;
            }
        } catch (error) {
            console.error(error);
            console.error("insert_category_history_hourly() failed");           
            return false; 
        }

    }   
}