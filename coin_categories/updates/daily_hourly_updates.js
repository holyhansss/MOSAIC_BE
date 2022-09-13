import {get_coins_specific_category, insert_ignore_to_db_table_column} from "../queries/queries.js"
import {daily_update_to_db_table_column, replaceToLatestValueAndSetIsNull} from "../queries/queries_daily.js"
import {getHistoricalData} from "../api.js"
import {getNDaysBefore, getYesterdaySecondPlusMin, get_24_hourly_time_list} from "../date_formatter.js"

const categories =  [
    'Currency',
    'Smart Contract Platform',
    'Computing',
    'DeFi',
    'Culture & Entertainment',
]

const dailyUpdates = async () => {
    //insert price data for today 
    for (let i=0; i<categories.length; i++){
        //Insert date to each category tables
        const categoryCoins = await get_coins_specific_category(categories[i])
        const tableName = categories[i] + "_prices";
        const start_date = getNDaysBefore(1)
        await insert_ignore_to_db_table_column(tableName, ["Date"], start_date)
        for (let j=0; j<categoryCoins.length; j++){
            //Insert coin price to each coin in category tables
            //If null, set isNull to 1 and copy previous value
            const coinpaprikaID = categoryCoins[j].CoinPapricaID;
            const coinID = categoryCoins[j].CoinSymbol;
            const yesterdayData = await getHistoricalData(coinpaprikaID, start_date, "1d");
            const price = yesterdayData[0].price;
            if (price == null) {
                // if price received from api is null
                replaceToLatestValueAndSetIsNull(tableName, coinID, start_date);
            } else {
                daily_update_to_db_table_column(tableName, coinID, start_date, price)
            }
        }
    }
}



const hourlyUpdates = async () => {
    //insert price data for current hour
    for (let i=0; i<categories.length; i++){
        const categoryCoins = await get_coins_specific_category(categories[i])
        const tableName = categories[i] + "_prices_hourly";
        const start_date = get_24_hourly_time_list()
        await insert_ignore_to_db_table_column(tableName, ["Date"], start_date);



    }
}