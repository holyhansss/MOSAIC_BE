import mysql from 'mysql2/promise';
import {MY_HOST, MY_USERNAME, MY_PASSWORD, MY_DATABASE} from "../../config/database.js";
import {getHistoricalData} from "../api.js"
import {get_364days_before, get_24_hourly_time_list, getYesterdaySecondPlusMin, getToday} from "../date_formatter.js"
import {get_coins_specific_category} from "./queries.js"

// let categories = 
let allCategories = 
[
    "Currency",                 
    "Smart Contract Platform",
    "Computing",
    "DeFi", 
    "Culture & Entertainment"
]

export const create_coindesk_table = async () => {
  let sql = "CREATE TABLE IF NOT EXISTS coindesk_coins_list(CoinSymbol varchar(10), CoinName varchar(50), Category varchar(30), IgnoreThis INT DEFAULT 0, CONSTRAINT PRIMARY KEY (CoinSymbol, CoinName))"
  const connection = await mysql.createConnection
      ({
          host: MY_HOST,
          user: MY_USERNAME,
          password: MY_PASSWORD,
          database : MY_DATABASE,
      });
    const [rows, fields] = await connection.execute(sql);
    console.log("end query create_coindesk_table()");
    return rows;
}

export const ignore_stablecoins = async (stableCoinList) => {
  let createSql = "CREATE TEMPORARY TABLE stable_coins_list(CoinSymbol varchar(10), CoinName varchar(50), CONSTRAINT PRIMARY KEY (CoinSymbol, CoinName))";
  let insertSql = 'INSERT INTO stable_coins_list VALUES ?';
  let ignoreStableCoinsSql = "UPDATE coindesk_coins_list INNER JOIN stable_coins_list ON coindesk_coins_list.CoinSymbol = stable_coins_list.CoinSymbol SET IgnoreThis=1"

  const connection = await mysql.createConnection
      ({
          host: MY_HOST,
          user: MY_USERNAME,
          password: MY_PASSWORD,
          database : MY_DATABASE,
      });
      try {
        await connection.execute(createSql);
        await connection.query(insertSql, [stableCoinList]);
        await connection.query(ignoreStableCoinsSql);    
      } catch (error) {
        console.error(error);
        return false;
      }
    console.log("end query ignore_stablecoins()");
    return true;
}

//Create categories coins list
export const create_categories_coins_list = async () => {
    let sql = "CREATE TABLE IF NOT EXISTS categories_coins_list (CoinSymbol varchar(10), CoinName varchar(50), CoinPapricaID varchar(50), Category varchar(30), CoinRank int, CONSTRAINT PRIMARY KEY (CoinSymbol, CoinName))"
    const connection = await mysql.createConnection
      ({
          host: MY_HOST,
          user: MY_USERNAME,
          password: MY_PASSWORD,
          database : MY_DATABASE,
      });
    const [rows, fields] = await connection.execute(sql);
    console.log("end query create_categories_coins_list()");
    return rows;
  }



  export const create_temporary_tables_for_category = async () => {
  let sql = "CREATE TEMPORARY TABLE categories_coins_list (CoinSymbol varchar(10), CoinName varchar(50), CoinPapricaID varchar(50), Category varchar(30), CoinRank int, CONSTRAINT PRIMARY KEY (CoinSymbol, CoinName))"
  const connection = await mysql.createConnection
    ({
        host: MY_HOST,
        user: MY_USERNAME,
        password: MY_PASSWORD,
        database : MY_DATABASE,
    });
  const [rows, fields] = await connection.execute(sql);
  console.log("end query create_temporary_tables_for_category()");
  return rows;
}

export const insert_dates = async (tableName, columnName, startDate, endDate) => {
  let subSql = 
  "\
    select gen_date from \
    (select adddate('1970-01-01',t4*10000 + t3*1000 + t2*100 + t1*10 + t0) gen_date from \
    (select 0 t0 union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t0, \
    (select 0 t1 union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t1, \
    (select 0 t2 union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t2, \
    (select 0 t3 union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t3, \
    (select 0 t4 union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t4) v \
    where gen_date between '" + startDate + "' and '" + endDate + "' order by gen_date asc \
  "
  
  let sql = 
  "\
  insert into `"+tableName+"` (`"+columnName+"`)\
    " + subSql
    try {
      const connection = await mysql.createConnection
      ({
          host: MY_HOST,
          user: MY_USERNAME,
          password: MY_PASSWORD,
          database : MY_DATABASE,
      });
      const [rows, fields] = await connection.execute(sql);
      console.log("end query insert_dates()");
      return true    
    } catch (error) {
      console.log(error);
      return false
    }
}

export const insert_time_data_hourly = async (categoryName) => {
  const tableName = categoryName + '_prices_hourly';
  try {
      const connection = await mysql.createConnection
      ({
      host: MY_HOST,
      user: MY_USERNAME,
      password: MY_PASSWORD,
      database : MY_DATABASE,
      });
  
      let sql = "insert ignore into `" + tableName + "` (Date) values ? "
      let timeList = await get_24_hourly_time_list();
      const [rows, fields] = await connection.query(sql, [timeList]);
  } catch (error) {
      console.log(error);
      return false
  }    
  console.log("end query insert_time_data_hourly()");        
  return true
}

export const create_category_history_daily_or_hourly = async (categoryName, dailyOrHourly) => {
  //Creates category table with date, each coin's price, and isNull to show if price data is null
  let tableName;
  if (dailyOrHourly == "daily") {
    tableName = categoryName + "_prices"
  } else if (dailyOrHourly == "hourly") {
    tableName = categoryName + "_prices_hourly"
  } else {
    console.error("Illegal dailyOrHourly value");
    return false;
  }
  let findSymbolOfCategoryCoinsSQL = "select CoinSymbol from categories_coins_list where Category = '" + categoryName + "' "
  let sqlCreate = "CREATE TABLE IF NOT EXISTS `" + tableName + "` (Date varchar(30)" 
    
  const connection = await mysql.createConnection
  ({
    host: MY_HOST,
    user: MY_USERNAME,
    password: MY_PASSWORD,
    database : MY_DATABASE,
  });

  const [categoryCoinsRows, categoryCoinsFields] = await connection.execute(findSymbolOfCategoryCoinsSQL);
  for (let i=0; i<categoryCoinsRows.length; i++) {
    sqlCreate = sqlCreate +", " + categoryCoinsRows[i].CoinSymbol;
    sqlCreate = sqlCreate + " DECIMAL(20, 6) "
    sqlCreate = sqlCreate +", " +  "isNull" + categoryCoinsRows[i].CoinSymbol;
    sqlCreate = sqlCreate + " INT default 0"

  }
  sqlCreate = sqlCreate + ", CONSTRAINT PRIMARY KEY (Date) )"
  console.log("end query create_category_history_hourly()");
  await connection.execute(sqlCreate);
  return true
}

export const insert_category_history_daily = async (categoryName) => { 
  //This function's goal is to insert the price data and date
  //for all coins within a category

  try {
    const connection = await mysql.createConnection
    ({
        host: MY_HOST,
        user: MY_USERNAME,
        password: MY_PASSWORD,
        database : MY_DATABASE,
    });
    const tableName = categoryName + "_prices";
    const coinsList = await get_coins_specific_category(categoryName);
    const lastYear = await get_364days_before();
  
    for (let i=0; i<coinsList.length; i++) { 
      // For all coins in this category, will make a temporary table 
      // with coin prices, and then insert temporary table's coin prices 
      // to the category table if both of their date value match
        const coinSymbol = coinsList[i].CoinSymbol;
        const coinpaprika_ID = coinsList[i].CoinPapricaID;
        const data = await getHistoricalData(coinpaprika_ID, lastYear, "1d");
        let priceAndTimeData = [];
        
        for (let j=0; j<data.length; j++) {
            let thisDate = JSON.stringify(data[j].timestamp)
            thisDate = thisDate.slice(1, -11);
            priceAndTimeData.push([thisDate, [data[j].price]])
        }
  
        const sqlCreateTemp = "CREATE Temporary TABLE `temp_table_daily_"+coinSymbol+"` (date varchar(30), `"+coinSymbol+"` decimal(20, 6) );"
        const sqlInsertTemp = "Insert into `temp_table_daily_"+coinSymbol+"` (date, `"+coinSymbol+"` ) values ?"
        await connection.query(sqlCreateTemp)
        await connection.query(sqlInsertTemp, [priceAndTimeData])
        const sql =  
            "UPDATE `"+tableName+"` T \
            SET T.`"+coinSymbol+"` = \
                (SELECT `"+coinSymbol+"` \
                FROM `temp_table_daily_"+coinSymbol+"` A \
                WHERE A.Date = T.Date)"
        const [categoryCoinsRows, categoryCoinsFields] = await connection.query(sql);
        // toDel
        // const sqlVer = "select * from `"+tableName+"` LIMIT 1";
        // const [r, s] = await connection.query(sqlVer);
        // console.log("r:", r);
    }
    console.log("end query insert_category_history_hourly()");  
  } catch (error) {
    console.error();
    return false
  }
  return true
}

export const insert_category_history_hourly = async (categoryName) => { 
  //This function's goal is to insert the price data and time (column named 'Date')
  //for all coins within a category

  try {
    const connection = await mysql.createConnection
    ({
        host: MY_HOST,
        user: MY_USERNAME,
        password: MY_PASSWORD,
        database : MY_DATABASE,
    });
  
    const tableName = categoryName + "_prices_hourly";
    const coinsList = await get_coins_specific_category(categoryName);
    const yesterday = await getYesterdaySecondPlusMin();
  
    for (let i=0; i<coinsList.length; i++) {
        // For all coins in this category, will make a temporary table 
        // with coin prices, and then insert temporary table's coin prices 
        // to the category table if both of their date value match
  
        const coinSymbol = coinsList[i].CoinSymbol;
        const coinpaprika_ID = coinsList[i].CoinPapricaID;
        const data = await getHistoricalData(coinpaprika_ID, yesterday, "1h");
        let priceAndTimeData = [];
  
        for (let j=0; j<data.length; j++) {
            let thisDate = JSON.stringify(data[j].timestamp)
            thisDate = thisDate.slice(1, -1);
            priceAndTimeData.push([thisDate, [data[j].price]])
        }
  
        const sqlCreateTemp = "CREATE Temporary TABLE `temp_table_hourly_"+coinSymbol+"` (date varchar(30), `"+coinSymbol+"` decimal(20, 6) );"
        const sqlInsertTemp = "Insert into `temp_table_hourly_"+coinSymbol+"` (date, `"+coinSymbol+"` ) values ?"
        await connection.query(sqlCreateTemp)
        await connection.query(sqlInsertTemp, [priceAndTimeData])
  
        const sqlSelect = "select * from `temp_table_hourly_"+coinSymbol+"`";
        const [selectRows, selectFields] = await connection.query(sqlSelect)
  
        const sql =  
            "UPDATE `"+tableName+"` T \
            SET T.`"+coinSymbol+"` = \
                (SELECT `"+coinSymbol+"` \
                FROM `temp_table_hourly_"+coinSymbol+"` A \
                WHERE A.Date = T.Date)"
  
        const [categoryCoinsRows, categoryCoinsFields] = await connection.query(sql);
    }
    console.log("end query insert_category_history_hourly()");  
  } catch (error) {
    console.log("error caught in insert_category_history_hourly()");
    console.error(error);
    return false
  }
  return true
}

export const nullValueCategory = async (categoryName, dailyOrHourly) => {
  //This function checks if there are any Null values in price values of 
  //category tables and replace the null values with their previous values.
  //If the first price is null, replace to the nearest next not null price value
  
  const connection = await mysql.createConnection
  ({
      host: MY_HOST,
      user: MY_USERNAME,
      password: MY_PASSWORD,
      database : MY_DATABASE,
  });
  
  let tableName;
  if (dailyOrHourly == "daily")
    tableName = categoryName + "_prices"; 
  else if (dailyOrHourly == "hourly")
    tableName = categoryName + "_prices_hourly"; 
  else 
    console.error("dailyOrHourly prop needs to be valid");

  const coinList = await get_coins_specific_category(categoryName);

  for (let i=0; i<coinList.length; i++) {
    const currCoin = coinList[i].CoinSymbol; 
    const isNullCurrCoin = "isNull" + currCoin; // there is a column that shows if a certain coin's price value is null ex) BTC =>  isNullBTC

  let sqlGetPrices ;
  if (dailyOrHourly == "daily")
    sqlGetPrices = "Select DATE_FORMAT(Date, '%Y-%m-%d') as Date, `"+ currCoin +"`, `"+ isNullCurrCoin +"` from `"+tableName+"` order by Date";
  else if (dailyOrHourly == "hourly")
    sqlGetPrices = "Select Date, `"+ currCoin +"`, `"+ isNullCurrCoin +"` from `"+tableName+"` order by Date";

    const [res, field] = await connection.query(sqlGetPrices);

    if (res[0][currCoin] == null){ 
      for (let j=0; j<coinList.length; j++) {
        if (res[j][currCoin] =! null) {
          res[0][currCoin] = res[j][currCoin];
          res[0][isNullCurrCoin] = 1;
        }
      }
    }

    let arryToInsert = []

    for (let j=0; j<res.length; j++) {
      //replace null values into prev values and change isNull value into 1
      //insert price and isNull values into arrays to insert into category db column
      if (res[j][currCoin] == null){
        res[j][currCoin] = res[j-1][currCoin];
        res[j][isNullCurrCoin] = 1;
      }
      arryToInsert.push([res[j]["Date"] ,res[j][currCoin], res[j][isNullCurrCoin]])
    }

    const temporaryTable = "temp_table_" + currCoin;
    const sqlCreateTemp = "CREATE Temporary TABLE `"+temporaryTable+"` (Date varchar(30), `"+currCoin+"` decimal(20, 6), `"+isNullCurrCoin+"` INT default 0);"    

    await connection.query(sqlCreateTemp);
    const sqlInsertTemp = 'INSERT INTO `' + temporaryTable + '` VALUES ?';
    await connection.query(sqlInsertTemp, [arryToInsert]);

    const sqlUpdateIsNull = 
      "update `"+ tableName +"` T \
      set \
        T.`"+isNullCurrCoin+"` = \
        (select `"+isNullCurrCoin+"` \
        from `"+temporaryTable+"` A \
      where T.date = A.date )"

    await connection.query(sqlUpdateIsNull);


    const sqlUpdatePrice = 
      "update `"+ tableName +"` T \
      set \
        T.`"+currCoin+"` = \
        (select `"+currCoin+"` \
        from `"+temporaryTable+"` A \
      where T.date = A.date )"

    await connection.query(sqlUpdatePrice);
  }
}

export const create_categories_graph_data_table_daily_or_hourly = async (dailyOrHourly) => {
  let sql; 
  if (dailyOrHourly == "1y" || dailyOrHourly == "1mo") 
    sql ="CREATE TABLE IF NOT EXISTS Categories_graph_data_daily (Date varchar(30)";
  else if (dailyOrHourly == "1d")
  sql ="CREATE TABLE IF NOT EXISTS Categories_graph_data_hourly (Date varchar(30)";
  
  for (let i=0; i<categories.length; i++) {
    sql = sql + ", `" + allCategories[i] + "` decimal(20,6)"
  }
  sql = sql + ", CONSTRAINT PRIMARY KEY (Date))"
  const connection = await mysql.createConnection
      ({
          host: MY_HOST,
          user: MY_USERNAME,
          password: MY_PASSWORD,
          database : MY_DATABASE,
      });
    try {
      await connection.execute(sql);        
    } catch (error) {
      console.error(error);
      return false
    }
    console.log("end query create_categories_graph_data_table_daily_or_hourly()");
    return true;
}


export const insert_calculated_prices_daily = async (categoriesWithCoins, dateRange) => {
  const firstCategoryName = categoriesWithCoins[0][0] + "_prices";
  let sql = "insert into Categories_graph_data_daily select DATE_FORMAT(`" + firstCategoryName + "`.date, '%Y-%m-%d') as time ";
  let sqlJoinTableList = "from `" + firstCategoryName + "`";
  for (let i=0; i<categoriesWithCoins.length; i++) {
      const categoryTableName = categoriesWithCoins[i][0] + "_prices"
      if (i > 0){
          sqlJoinTableList = sqlJoinTableList + " join `"+ categoryTableName +"` on `"+ firstCategoryName +"`.date = `"+ categoryTableName +"`.date";
      }
      const sqlToMerge = await sql_to_merge_category(categoryTableName, categoriesWithCoins[i][1])
      sql = sql + sqlToMerge;
  }
  sql = sql + sqlJoinTableList;
  const today = await getToday();
  if (dateRange == "1y") {
      sql = sql + " where `"+firstCategoryName+"`.date between DATE_ADD(DATE_ADD('"+ today +"', INTERVAL 1 DAY), INTERVAL -1 YEAR) and '"+ today + "' ";
  } else if (dateRange == "1mo"){
      sql = sql + " where `"+firstCategoryName+"`.date between DATE_ADD('"+ today +"', INTERVAL -1 MONTH) and '"+ today + "' ";
  } else {
      console.error("invalid date range in return_calculated_prices_daily");
  }
  const connection = await mysql.createConnection
  ({
      host: MY_HOST,
      user: MY_USERNAME,
      password: MY_PASSWORD,
      database : MY_DATABASE,
  });
  const [rows, fields] = await connection.execute(sql);
  console.log("end query return_calculated_prices_daily()");
  console.log(sql);
  return rows;
}


const sql_to_merge_category = (tableName, coinList) => {
  let sqlToMerge = ", round( ";
  let categoryNameToReturn = tableName.slice(0, -7)
  const coinNum = coinList.length;
  const today = getToday();
  const queryUTCBefore1Month = "DATE_ADD('"+ today +"', INTERVAL -1 MONTH)"
  const queryUTCBefore364days = "DATE_ADD(DATE_ADD('"+ today +"', INTERVAL 1 DAY), INTERVAL -1 YEAR)"

  for (let i=0; i<coinNum; i++) {
      if (i==0) {
          sqlToMerge = sqlToMerge + "IFNULL ((`"+coinList[i]+"` * 100 / (select `"+coinList[i]+"` from `"+tableName+"` LIMIT 0,1) / "+coinNum+"), 0)";
      } else {
          sqlToMerge = sqlToMerge + " + IFNULL ((`"+coinList[i]+"` * 100 / (select `"+coinList[i]+"` from `"+tableName+"` LIMIT 0,1) / "+coinNum+"), 0)";

      }
  }
  sqlToMerge = sqlToMerge + ", 1) as `"+ categoryNameToReturn+"` ";
  console.log("end query sql_to_merge_category()");
  return sqlToMerge
}

export const insert_calculated_prices_hourly = async (categoriesWithCoins, dateRange) => {
  const firstCategoryName = categoriesWithCoins[0][0] + "_prices_hourly";
  // CONVERT_TZ(`" + firstCategoryName + "`.date,'+00:00','+09:00')
  // let sql = "select DATE_FORMAT(`" + firstCategoryName + "`.date, '%d' '%h') as time ";
  let sql = "insert into Categories_graph_data_hourly select DATE_FORMAT(  CONVERT_TZ(`" + firstCategoryName + "`.date,'+00:00','+09:00') , '%h') as time ";
  let sqlJoinTableList = "from `" + firstCategoryName + "`";
  for (let i=0; i<categoriesWithCoins.length; i++) {
      const categoryTableName = categoriesWithCoins[i][0] + "_prices_hourly"
      if (i > 0){
          sqlJoinTableList = sqlJoinTableList + " join `"+ categoryTableName +"` on `"+ firstCategoryName +"`.date = `"+ categoryTableName +"`.date";
      }
      const sqlToMerge = await sql_to_merge_category_1d(categoryTableName, categoriesWithCoins[i][1])
      sql = sql + sqlToMerge;
      }
      sql = sql + sqlJoinTableList;
      const today = getToday();
      const queryUTCNow = "utc_timestamp()";
      // const queryUTCBefore23 = "DATE_FORMAT(DATE_ADD(utc_timestamp(), INTERVAL -23 HOUR), '%Y-%m-%dT%TZ')"
      const queryUTCBefore23 = "DATE_FORMAT(DATE_ADD(utc_timestamp(), INTERVAL -50 HOUR), '%Y-%m-%dT%TZ')"
  if (dateRange == "1d") {
      sql = sql + " where `"+firstCategoryName+"`.date between " + queryUTCBefore23 +" and "+ queryUTCNow ;
  } else {
      console.error("invalid date range in insert_calculated_prices_hourly");
      }
  const connection = await mysql.createConnection
  ({
      host: MY_HOST,
      user: MY_USERNAME,
      password: MY_PASSWORD,
      database : MY_DATABASE,
  });

  const [rows, fields] = await connection.execute(sql);
  console.log("end query insert_calculated_prices_hourly()");
  return rows;
}

const sql_to_merge_category_1d = (tableName, coinList) => {
  let sqlToMerge = ", round( ";
  let categoryNameToReturn = tableName.slice(0, -14)
  const coinNum = coinList.length;
  const queryUTCBefore23h = "DATE_FORMAT(DATE_ADD(utc_timestamp(), INTERVAL -50 HOUR), '%Y-%m-%dT%TZ')"

  for (let i=0; i<coinNum; i++) {
      if (i==0) {
          sqlToMerge = sqlToMerge + "IFNULL ((`"+coinList[i]+"` * 100 / (select `"+coinList[i]+"` from `"+tableName+"` d where d.date > "+queryUTCBefore23h+" LIMIT 0,1) / "+coinNum+"), 0)";
      } else {
          sqlToMerge = sqlToMerge + " + IFNULL ((`"+coinList[i]+"` * 100 / (select `"+coinList[i]+"` from `"+tableName+"` d where d.date > "+queryUTCBefore23h+" LIMIT 0,1) / "+coinNum+"), 0)";
      }
  }
  sqlToMerge = sqlToMerge + ", 1) as `"+ categoryNameToReturn+"` ";
  return sqlToMerge
}

export const createGraphDataMinMaxYearlyOrMonthlyOrDaily = async (yearlyOrMonthlyOrDaily) => {
  let sql ;
  if (yearlyOrMonthlyOrDaily == "1y")
    sql = "create table min_max_1y (min decimal(20,6), max decimal(20,6))";
  else if  (yearlyOrMonthlyOrDaily == "1mo")
    sql = "create table min_max_1mo (min decimal(20,6), max decimal(20,6))";
  else if  (yearlyOrMonthlyOrDaily == "1d")
    sql = "create table min_max_1d (min decimal(20,6), max decimal(20,6))";
  else 
    console.error("invalid yearlyOrMonthlyOrDaily value in createGraphDataMinMaxYearlyOrMonthlyOrDaily()");

  const connection = await mysql.createConnection
  ({
      host: MY_HOST,
      user: MY_USERNAME,
      password: MY_PASSWORD,
      database : MY_DATABASE,
  });
  try {
    const [rows, fields] = await connection.execute(sql);
  } catch (error) {
    console.error(error);
    console.error("createGraphDataMinMax failed");
    return false
  }
  console.log("end query createGraphDataMinMax()");
  return true;
}
