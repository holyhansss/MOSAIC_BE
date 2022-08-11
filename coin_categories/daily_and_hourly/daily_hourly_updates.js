import {get_coins_specific_category, insert_ignore_to_db_table_column} from "../queries/queries.js"
import {daily_update_to_db_table_column, replaceToLatestValueAndSetIsNull} from "../queries/queries_daily.js"
import {getHistoricalData} from "../api.js"
import {getNDaysBefore} from "../date_formatter.js"

const categories =  [
    'Currency',
    'Smart Contract Platform',
    'Computing',
    'DeFi',
    'Culture & Entertainment',
]

const dailyUpdates = async () => {
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
                replaceToLatestValueAndSetIsNull(tableName, coinID, start_date);
            } else {
                daily_update_to_db_table_column(tableName, coinID, start_date, price)
            }
        }
    }
}

