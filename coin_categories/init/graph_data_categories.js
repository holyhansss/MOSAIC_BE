import {create_categories_graph_data_table_daily_or_hourly, insert_calculated_prices_daily, insert_calculated_prices_hourly, createGraphDataMinMaxYearlyOrMonthlyOrDaily} from "../queries/queries_init.js"
import {get_coins_specific_category, insert_min_max_1y_1mo_1d} from "../queries/queries.js"


export const InitGraphData = async () => {
    try {
        await create_categories_graph_data_table_daily_or_hourly("1y");
        await create_categories_graph_data_table_daily_or_hourly("1d");            
        await InsertCategoryGraphDataDailyORHourly("1y");
        await InsertCategoryGraphDataDailyORHourly("1d");
        await createGraphDataMinMaxYearlyOrMonthlyOrDaily("1y")
        await createGraphDataMinMaxYearlyOrMonthlyOrDaily("1mo")
        await createGraphDataMinMaxYearlyOrMonthlyOrDaily("1d")
        insert_min_max_1y_1mo_1d("1y")
        insert_min_max_1y_1mo_1d("1mo")
        insert_min_max_1y_1mo_1d("1d")
    } catch (error) {
        console.error(error);
        console.error("initGraphData Failed");
        return false
    }
    return true
}


export const InsertCategoryGraphDataDailyORHourly = async (dailyOrHourly) => {
    const allCategories = 
      [
          [["Currency"],[]],                 
          [["Smart Contract Platform"] ,[]],
          [["Computing"] , []],
          [["DeFi"] , []],        
          [["Culture & Entertainment"] , []],
      ]
    try {
        for (let i=0; i<allCategories.length; i++){
            const thisCategoryCoins = await get_coins_specific_category(allCategories[i][0]); 
            //카테고리 해당되는 코인들 삽입
            for (let j=0; j<thisCategoryCoins.length; j++) {
              // console.log(thisCategoryCoins[j].CoinSymbol);
              allCategories[i][1].push(thisCategoryCoins[j].CoinSymbol)
            }
        }
        if (dailyOrHourly == "1y" || dailyOrHourly == "1mo" )
          //data for 1y and 1mo are the same
          await insert_calculated_prices_daily (allCategories, "1y") //계산된 가격 코인 별 불러오기 (기준 100으로 맞춤)
        else if (dailyOrHourly == "1d")
          await insert_calculated_prices_hourly(allCategories, "1d") //계산된 가격 코인 별 불러오기 (기준 100으로 맞춤)
        else {
          console.error("dailyOrHourly data was not correctly initiated in call_query_to_insert_category_data_daily_or_hourly()");
          return false;
        } 
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

// InitGraphData()