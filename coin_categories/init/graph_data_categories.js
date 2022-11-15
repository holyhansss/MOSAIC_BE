import {create_categories_graph_data_table_daily_or_hourly, insert_calculated_prices_daily, insert_calculated_prices_hourly, createGraphDataMinMaxYearlyOrMonthlyOrDaily} from "../queries/queries_init.js"
import {get_coins_specific_category, insert_min_max_1y_1mo_1d} from "../queries/queries.js"


// Categories_graph_data_1y
export const InitGraphData = async () => {
  // function to initialize tables for graph data table
  try {
      
        await create_categories_graph_data_table_daily_or_hourly("1y"); 
        await create_categories_graph_data_table_daily_or_hourly("1mo"); 
        await create_categories_graph_data_table_daily_or_hourly("6mo"); 
        // await create_categories_graph_data_table_daily_or_hourly("1d");            
        await InsertCategoryGraphDataDailyORHourly("1y");
        await InsertCategoryGraphDataDailyORHourly("1mo");
        await InsertCategoryGraphDataDailyORHourly("6mo");
        // await InsertCategoryGraphDataDailyORHourly("1d");
        await createGraphDataMinMaxYearlyOrMonthlyOrDaily("1y")
        await createGraphDataMinMaxYearlyOrMonthlyOrDaily("1mo")
        await createGraphDataMinMaxYearlyOrMonthlyOrDaily("6mo")
        // await createGraphDataMinMaxYearlyOrMonthlyOrDaily("1d")
        insert_min_max_1y_1mo_1d("1y")
        insert_min_max_1y_1mo_1d("1mo")
        insert_min_max_1y_1mo_1d("6mo")
        // insert_min_max_1y_1mo_1d("1d")
    } catch (error) {
        console.error(error);
        console.error("initGraphData Failed");
        return false
    }
    return true
}


export const InsertCategoryGraphDataDailyORHourly = async (dailyOrHourly) => {
  // function to insert calculated graph data prices
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
        if (dailyOrHourly == "1y")
          await insert_calculated_prices_daily (allCategories, "1y") //계산된 가격 코인 별 불러오기 (기준 100으로 맞춤)
        else if (dailyOrHourly == "6mo")
          await insert_calculated_prices_daily(allCategories, "6mo") //계산된 가격 코인 별 불러오기 (기준 100으로 맞춤)
        else if (dailyOrHourly == "1mo")
          await insert_calculated_prices_daily(allCategories, "1mo") //계산된 가격 코인 별 불러오기 (기준 100으로 맞춤)
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

