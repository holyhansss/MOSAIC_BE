import mysql from 'mysql2/promise';
import {MY_HOST, MY_USERNAME, MY_PASSWORD, MY_DATABASE} from "../../config/database.js";
import {getHistoricalData} from "../api.js"
import {getToday, get_364days_before, getYesterdaySecondPlusMin, getNDaysBefore, get_24_hourly_time_list} from "../date_formatter.js";

const allCategories = 
[
    [["Currency"],[]],                 
    [["Smart Contract Platform"] ,[]],
    [["Computing"] , []],
    [["DeFi"] , []],        
    [["Culture & Entertainment"] , []],
]


export const get_category_data_1d = async (req, res) => {
    //This function returns 1d graph data to the client server
    console.log("Categories to show 1y:", req.query.categoryArray);
    const categoriesToShowArray = req.query.categoryArray; 
    console.log("categoriesToShowArray 1y: ", categoriesToShowArray);

    let categories = [];
    for (let i=0; i<allCategories.length; i++) {
        if (categoriesToShowArray[i] == 'false')
            continue;
        categories.push(allCategories[i])
    }

    try {
        for (let i=0; i<categories.length; i++){
            const thisCategoryCoins = await get_coins_specific_category(categories[i][0]); 
            //카테고리 해당되는 코인들 삽입
            for (let j=0; j<thisCategoryCoins.length; j++) {
                categories[i][1].push(thisCategoryCoins[j].CoinSymbol)
            }
        }
        let responseToSend = [];
         const datesAndPrices = await return_calculated_prices(categories, "1d") //계산된 가격 코인 별 불러오기 (기준 100으로 맞춤)
         const minMax = await get_min_max_1y_1mo_1d("1d")
         responseToSend.push(datesAndPrices)
         responseToSend.push(minMax)
         res.send(responseToSend);
    } catch (error) {
        console.log(error);
        res.json({ message: error.message });        
    }
}

export const get_category_data_1mo = async (req, res) => {
    //This function returns 1mo graph data to the client server
    console.log("Categories to show 1mo:", req.query.categoryArray);
    const categoriesToShowArray = req.query.categoryArray; 
    console.log("categoriesToShowArray 1mo: ", categoriesToShowArray);

    let categories = [];
    for (let i=0; i<allCategories.length; i++) {
        if (categoriesToShowArray[i] == 'false')
            continue;
        categories.push(allCategories[i])
    }

    try {
        for (let i=0; i<categories.length; i++){
            const thisCategoryCoins = await get_coins_specific_category(categories[i][0]);
            for (let j=0; j<thisCategoryCoins.length; j++) { 
                //카테고리 해당되는 코인들 삽입
                categories[i][1].push(thisCategoryCoins[j].CoinSymbol)
            }
        }
        let responseToSend = [];
         const datesAndPrices = await return_calculated_prices(categories, "1mo") //계산된 가격 코인 별 불러오기 (기준 100으로 맞춤)
         const minMax = await get_min_max_1y_1mo_1d("1mo")
         responseToSend.push(datesAndPrices)
         responseToSend.push(minMax)
         res.send(responseToSend);
    } catch (error) {
        console.log(error);
        res.json({ message: error.message });        
    }
}

export const get_category_data_1yr = async (req, res) => {
    //This function returns 1yr graph data to the client server
    console.log("Categories to show 1y:", req.query.categoryArray);
    const categoriesToShowArray = req.query.categoryArray; 
    console.log("categoriesToShowArray 1y: ", categoriesToShowArray);

    let categories = [];
    for (let i=0; i<allCategories.length; i++) {
        if (categoriesToShowArray[i] == 'false')
            continue;
        categories.push(allCategories[i])
    }

    try {
        for (let i=0; i<categories.length; i++){
            const thisCategoryCoins = await get_coins_specific_category(categories[i][0]);
            for (let j=0; j<thisCategoryCoins.length; j++) {
                //카테고리 해당되는 코인들 삽입
                categories[i][1].push(thisCategoryCoins[j].CoinSymbol)
            }
        }
        let responseToSend = [];
         const datesAndPrices = await return_calculated_prices(categories, "1y") //계산된 가격 코인 별 불러오기 (기준 100으로 맞춤)
         const minMax = await get_min_max_1y_1mo_1d("1y")
         responseToSend.push(datesAndPrices)
         responseToSend.push(minMax)
         console.log("minmax 1y: ", minMax);
         res.send(responseToSend);
    } catch (error) {
        console.log(error);
        res.json({ message: error.message });        
    }
}


export const insert_to_db_table = async (tableName, valuesList) => {
    // query to insert valuesList into tableName
    let sql = 'INSERT INTO `' + tableName + '` VALUES ?'
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


export const insert_to_db_columns = async (tableName, columnList, valuesList) => {
    //query to insert valuesList in columnList of tableName
    let sql = 'INSERT INTO `' + tableName + '` (';
    for (let i=0; i<columnList.length; i++) {
        sql = sql + columnList[i];
        if (i + 1 < columnList.length) {
            sql= sql + ', '
        }
    }
    sql = sql + ') VALUES ?'

    const connection = await mysql.createConnection
    ({
      host: MY_HOST,
      user: MY_USERNAME,
      password: MY_PASSWORD,
      database : MY_DATABASE,
  });
    const [rows, fields] = await connection.query(sql, [valuesList]);
    console.log("end query insert_to_db_columns() for tableName "+tableName);
    return rows;
}


export const insert_ignore_to_db_table_column = async (tableName, columns, valuesList) => {
    // query to insert ignore valuesList in tableName.columns
    let sql = 'INSERT IGNORE INTO `' + tableName + "` (";
    for (let i=0; i<columns.length; i++) {
      sql = sql + columns[i];
      if (i+1 < columns.length) {
        sql = sql + ", ";
      }
    }
    sql = sql + ") " +  ' VALUES (?)';
    
    const connection = await mysql.createConnection
    ({
      host: MY_HOST,
      user: MY_USERNAME,
      password: MY_PASSWORD,
      database : MY_DATABASE,
    });
    const [rows, fields] = await connection.query(sql, [valuesList]);
    console.log("end query insert_ignore_to_db_table_column() for tableName "+tableName);
    return rows;
  }

export const get_coindesk_coins = async () => {
    // query to get coindesk_coins_list
    let sql = "SELECT * from coindesk_coins_list";
    const connection = await mysql.createConnection
    ({
        host: MY_HOST,
        user: MY_USERNAME,
        password: MY_PASSWORD,
        database : MY_DATABASE,
    });
    const [rows, fields] = await connection.execute(sql);

    console.log("end query get_coindesk_coins()");
    return rows;
  }

export const get_categories_coins_sorted_by_rank = async () => {
    // query to get categories_coins_list ordered by CoinRank
let sql = "SELECT * from categories_coins_list order by CoinRank";
const connection = await mysql.createConnection
({
    host: MY_HOST,
    user: MY_USERNAME,
    password: MY_PASSWORD,
    database : MY_DATABASE,
});
const [rows, fields] = await connection.execute(sql);

console.log("end query get_categories_coins()");
return rows;
}


export const get_coins_specific_category = async (thisCategory) => {
    // query to get CoinSymbol and CoinPapricaID from categories_coins_list if Category == 'thisCategory'
    let sql = "SELECT CoinSymbol, CoinPapricaID FROM categories_coins_list where Category = '"+thisCategory+"' ";
    const connection = await mysql.createConnection
    ({
      host: MY_HOST,
      user: MY_USERNAME,
      password: MY_PASSWORD,
      database : MY_DATABASE,
  });
    const [rows, fields] = await connection.execute(sql);
    console.log("end query get_all_coins_all_categories()");
    return rows;
  }

export const return_calculated_prices = async (categories, dateRange) => {
    // query to return graph data within dateRange from Categories_graph_data_daily or Categories_graph_data_hourly 
    // range is 364 days if dateRange == '1y', 30 days if dateRange == '1mo', 23 hours if dateRange == '1d'
    let tableName;
    let startDate;
    let minmaxTable;
    let dateFormat;

    if (dateRange == "1y") {
        tableName = "Categories_graph_data_daily";
        startDate = get_364days_before();
        minmaxTable = "min_max_1y"
        dateFormat = "date, '%Y-%m-%d'"
    } else if (dateRange == "1mo"){
        tableName = "Categories_graph_data_daily";
        startDate = getNDaysBefore(30);
        minmaxTable = "min_max_1mo"
        dateFormat = "date, '%Y-%m-%d'"
    } else if (dateRange == "1d"){
        tableName = "Categories_graph_data_hourly";
        startDate = getYesterdaySecondPlusMin();
        minmaxTable = "min_max_1d"
        dateFormat = "CONVERT_TZ(date,'+00:00','+09:00') , '%h'"
    } else {
        console.error("Invalid dateRange in return_calculated_prices");
        return false;
    }

    let sql = "select DATE_FORMAT("+dateFormat+") as time ";
    for (let i=0; i<categories.length; i++) {
        sql = sql + ", `" + categories[i][0] + "`";
    }
    sql = sql + "from " + tableName;
    sql = sql + " where date > '"+startDate+"'"
    const today = await getToday();
    const connection = await mysql.createConnection
    ({
        host: MY_HOST,
        user: MY_USERNAME,
        password: MY_PASSWORD,
        database : MY_DATABASE,
    });
    const [rows, fields] = await connection.execute(sql);
    console.log("end query return_calculated_prices()");
    console.log(sql);
    console.log(rows);
    return rows;
}

export const insert_min_max_1y_1mo_1d = async (yearMonthOrDay) => {
    // query to insert min and max values in tableName 
    // min and max to use when graph plot in client
    let startDate;
    let tableName;
    let insertToTable;
    if (yearMonthOrDay=="1y"){
        startDate = get_364days_before();
        tableName = "Categories_graph_data_daily";
        insertToTable = "min_max_1y"
    }else if(yearMonthOrDay=="1mo"){
        startDate = getNDaysBefore(30);
        tableName = "Categories_graph_data_daily";
        insertToTable = "min_max_1mo"
    }else if(yearMonthOrDay=="1d"){
        startDate = getYesterdaySecondPlusMin();
        tableName = "Categories_graph_data_hourly";
        insertToTable = "min_max_1d"
    }
    let sql = "insert into "+insertToTable+" select floor(MIN(T.price)) as min, ceiling(MAX(T.price)) as max from (select `" + allCategories[0][0] + "` as price, date from " + tableName;
    for (let i=1; i<allCategories.length; i++) {
        sql = sql + " union all select `" + allCategories[i][0] + "` as price, date from " +tableName ;
    }
    sql = sql + ") as T where date > '"+startDate+"'";
    const connection = await mysql.createConnection
    ({
        host: MY_HOST,
        user: MY_USERNAME,
        password: MY_PASSWORD,
        database : MY_DATABASE,
    });
    console.log(sql);
    const [rows, fields] = await connection.execute(sql);
    console.log("end query insert_min_max_1y_1mo_1d()");
    return rows;
}

export const get_min_max_1y_1mo_1d = async (yearMonthOrDay) => {
    // get min max values min_max_1y or min_max_1mo or min_max_1d
    let tableName;
    let sql;
    if (yearMonthOrDay=="1y"){
        sql = "select * from min_max_1y"
    }else if(yearMonthOrDay=="1mo"){
        sql = "select * from min_max_1mo"
    }else if(yearMonthOrDay=="1d"){
        sql = "select * from min_max_1d"
    }
    const connection = await mysql.createConnection
    ({
        host: MY_HOST,
        user: MY_USERNAME,
        password: MY_PASSWORD,
        database : MY_DATABASE,
    });
    console.log(sql);
    const [rows, fields] = await connection.execute(sql);
    const returnVal = [rows[0].min, rows[0].max]
    console.log("end query get_min_max_1y_1mo_1d()");
    return returnVal;
}
