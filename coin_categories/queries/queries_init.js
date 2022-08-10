import mysql from 'mysql2/promise';
import {MY_HOST, MY_USERNAME, MY_PASSWORD, MY_DATABASE} from "../../config/database.js";
import {getHistoricalData} from "../api.js"
import {get_364days_before, getToday} from "../date_formatter.js"
import {get_coins_specific_category} from "./queries.js"

let categories = 
[
    "Currency",                 
    "Smart Contract Platform",
    "Computing",
    "DeFi", 
    "Culture & Entertainment"
]

const create_coindesk_table = async () => {
  let sql = "CREATE TABLE IF NOT EXISTS coindesk_coins_list(CoinSymbol varchar(10), CoinName varchar(50), Category varchar(30) CONSTRAINT PRIMARY KEY (CoinSymbol))"
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


//Create categories coins list
export const create_categories_coins_list = async () => {
    let sql = "CREATE TABLE categories_coins_list (CoinSymbol varchar(10), CoinName varchar(50), CoinPapricaID varchar(50), Category varchar(30), CoinRank int, CONSTRAINT PRIMARY KEY (CoinSymbol) )"
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


//Insert data to table
export const insert_to_db_table = async (tableName, valuesList) => {
    let sql = 'INSERT INTO `' + tableName + '` VALUES ?';
    
    const connection = await mysql.createConnection
    ({
      host: MY_HOST,
      user: MY_USERNAME,
      password: MY_PASSWORD,
      database : MY_DATABASE,
  });
    const [rows, fields] = await connection.query(sql, [valuesList]);
    console.log("end query insert_to_db_table() for tableName "+tableName);
    return rows;
  }

  //Create table and insert data when coin table does NOT already exist
//! may have to amend incoming date format
export const create_coin_table = async (tableName) => {

    let sql = "CREATE TABLE `" + tableName + "` (Date DATE, PriceInDollar DECIMAL(20, 6), CONSTRAINT PRIMARY KEY (Date))"
    const connection = await mysql.createConnection
    ({
      host: MY_HOST,
      user: MY_USERNAME,
      password: MY_PASSWORD,
      database : MY_DATABASE,
  });
    const [rows, fields] = await connection.execute(sql);
    console.log("end query create_coin_table()");
    return rows;
  }
  

export const create_temporary_tables_for_category = async () => {
  let sql = "CREATE TEMPORARY TABLE categories_coins_list (CoinSymbol varchar(10), CoinName varchar(50), CoinPapricaID varchar(50), Category varchar(30), CoinRank int, CONSTRAINT PRIMARY KEY (CoinSymbol))"
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

  const connection = await mysql.createConnection
    ({
        host: MY_HOST,
        user: MY_USERNAME,
        password: MY_PASSWORD,
        database : MY_DATABASE,
    });
    console.log(sql);
  const [rows, fields] = await connection.execute(sql);
  console.log("end query fill_daterange_column()");
}


const insert_time_data_hourly = async (categoryName) => {
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
      console.log(sql);
      console.log(timeList);
      const [rows, fields] = await connection.query(sql, [timeList]);
      console.log("end query insert_time_data_hourly()");        
  } catch (error) {
      console.log(error);
  }    
}

export const insert_category_history_hourly = async (categoryName) => { 
  
  let categories = 
  [
      [["Currency"],[]],                 
      [["Smart Contract Platform"] ,[]],
      [["Computing"] , []],
      [["DeFi"] , []],        
      [["Culture & Entertainment"] , []],
      // [["Digitization"], []]
  ]
  const connection = await mysql.createConnection
  ({
      host: MY_HOST,
      user: MY_USERNAME,
      password: MY_PASSWORD,
      database : MY_DATABASE,
  });

  const coinsList = await get_coins_specific_category(categoryName);

  console.log("coinsList:", coinsList);

  for (let i=0; i<coinsList.length; i++) {
      const coinSymbol = coinsList[i].CoinSymbol;
      const tableName = categoryName + "_prices_hourly";
      const coinpaprika_ID = coinsList[i].CoinPapricaID;
      const yesterday = await getYesterdaySecondPlusMin();

      const data = await getHistoricalData(coinpaprika_ID, yesterday, "1h");

      console.log("data: ", data);
      let priceData = [];
      let timeData = [];
      let priceAndTimeData = [];
      for (let j=0; j<data.length; j++) {
          let thisDate = JSON.stringify(data[j].timestamp)
          thisDate = thisDate.slice(1, -1);
          priceAndTimeData.push([thisDate, [data[j].price]])
      }
      console.log("timeData",timeData);
      console.log("priceData", priceData);
      const sqlCreateTemp = "CREATE Temporary TABLE `temp_table_"+coinSymbol+"` (date varchar(30), `"+coinSymbol+"` decimal(20, 6) );"
      const sqlInsertTemp = "Insert into `temp_table_"+coinSymbol+"` (date, `"+coinSymbol+"` ) values ?"
      // const sqlInsertTempPrice = "update `temp_table_"+coinSymbol+"` set (`"+coinSymbol+"`) values ?"
      await connection.query(sqlCreateTemp)
      await connection.query(sqlInsertTemp, [priceAndTimeData])

      const sqlSelect = "select * from `temp_table_"+coinSymbol+"`";
      const [selectRows, selectFields] = await connection.query(sqlSelect)
      console.log("sql select temptable", selectRows);

      const sql =  
          "UPDATE `"+tableName+"` T \
          SET T.`"+coinSymbol+"` = \
              (SELECT `"+coinSymbol+"` \
              FROM `temp_table_"+coinSymbol+"` A \
              WHERE A.Date = T.Date)"

      console.log(sql);
      const [categoryCoinsRows, categoryCoinsFields] = await connection.query(sql, [priceData], [timeData]);
      const sqlVer = "select * from `"+tableName+"`";
      const [r, s] = await connection.query(sqlVer);
      console.log("r:", r);
  }
  console.log("end query insert_category_history_hourly()");
}

export const create_category_history_hourly = async (categoryName) => {
  // await get_coins_specific_category(categoryName);
  const tableName = categoryName + "_prices_hourly1"
  let categoryCoins = []
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
  console.log(sqlCreate);
  console.log("end query create_category_history_hourly()");
  await connection.execute(sqlCreate);
}


export const create_category_history_daily = async (categoryName) => {
  //Creates category table with date, each coin's price, and isNull to show if price data is null
  const tableName = categoryName + "_prices"
  let categoryCoins = []
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
  console.log(sqlCreate);
  console.log("end query create_category_history_hourly()");
  await connection.execute(sqlCreate);
}


export const insert_category_history_daily = async (categoryName) => { 
  //This function's goal is to insert the price data and date
  //for all coins within a category
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
  const today = getToday()
  await insert_dates (tableName, "Date", lastYear, today);

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
      console.log(sql);
      const [categoryCoinsRows, categoryCoinsFields] = await connection.query(sql);
      // toDel
      // const sqlVer = "select * from `"+tableName+"` LIMIT 1";
      // const [r, s] = await connection.query(sqlVer);
      // console.log("r:", r);
  }
  console.log("end query insert_category_history_hourly()");
}


const nullValueCategory = async (categoryName) => {
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
  // const tableName = categoryName + "_prices"; 
  const tableName = categoryName + "_prices"; // test 
  const coinList = await get_coins_specific_category(categoryName);
  console.log(coinList); 
  for (let i=0; i<coinList.length; i++) {
    const currCoin = coinList[i].CoinSymbol; 
    const isNullCurrCoin = "isNull" + currCoin; // there is a column that shows if a certain coin's price value is null ex) BTC =>  isNullBTC

    const sqlGetPrices = "Select DATE_FORMAT(Date, '%Y-%m-%d') as Date, `"+ currCoin +"`, `"+ isNullCurrCoin +"` from `"+tableName+"` order by Date";
    const [res, field] = await connection.query(sqlGetPrices);
    console.log(res);
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
        console.log(j + "th row is null for " + currCoin);
        res[j][currCoin] = res[j-1][currCoin];
        res[j][isNullCurrCoin] = 1;
      }
      arryToInsert.push([res[j]["Date"] ,res[j][currCoin], res[j][isNullCurrCoin]])
    }
    console.log(arryToInsert);

    const temporaryTable = "temp_table_" + currCoin;
    const sqlCreateTemp = "CREATE Temporary TABLE `"+temporaryTable+"` (Date DATE, `"+currCoin+"` decimal(20, 6), `"+isNullCurrCoin+"` INT default 0);"    
    console.log(sqlCreateTemp);
    await connection.query(sqlCreateTemp);
    const sqlInsertTemp = 'INSERT INTO `' + temporaryTable + '` VALUES ?';
    console.log(sqlInsertTemp);
    await connection.query(sqlInsertTemp, [arryToInsert]);

    const sqlUpdateIsNull = 
      "update `"+ tableName +"` T \
      set \
        T.`"+isNullCurrCoin+"` = \
        (select `"+isNullCurrCoin+"` \
        from `"+temporaryTable+"` A \
      where T.date = A.date )"

    console.log(sqlUpdateIsNull);
    await connection.query(sqlUpdateIsNull);


    const sqlUpdatePrice = 
      "update `"+ tableName +"` T \
      set \
        T.`"+currCoin+"` = \
        (select `"+currCoin+"` \
        from `"+temporaryTable+"` A \
      where T.date = A.date )"

    console.log(sqlUpdatePrice);
    await connection.query(sqlUpdatePrice);
  }
}


nullValueCategory("Currency");


