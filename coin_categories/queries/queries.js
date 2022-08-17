import mysql from 'mysql2/promise';
import {MY_HOST, MY_USERNAME, MY_PASSWORD, MY_DATABASE} from "../../config/database.js";
import {getHistoricalData} from "../api.js"
import {getToday, getYesterdaySecondPlusMin, get_24_hourly_time_list} from "../date_formatter.js";

const allCategories = 
[
    [["Currency"],[]],                 
    [["Smart Contract Platform"] ,[]],
    [["Computing"] , []],
    [["DeFi"] , []],        
    [["Culture & Entertainment"] , []],
    // [["Digitization"], []]
]

export const insert_to_db_table = async (tableName, columnList, valuesList) => {
    let sql = 'INSERT INTO `' + tableName + '` VALUES ?'

    const connection = await mysql.createConnection
    ({
      host: MY_HOST,
      user: MY_USERNAME,
      password: MY_PASSWORD,
      database : MY_DATABASE,
  });
    const [rows, fields] = await connection.query(sql,]);
    console.log("end query insert_to_db_table() for tableName "+tableName);
    return rows;
}


export const insert_to_db_columns = async (tableName, columnList, valuesList) => {
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

export const get_category_data_1d = async (req, res) => {
    console.log("Categories to show 1y:", req.query.categoryArray);
    const categoriesToShowArray = req.query.categoryArray; 
    console.log("categoriesToShowArray 1y: ", categoriesToShowArray);

    let categories = [];
    for (let i=0; i<allCategories.length; i++) {
        if (categoriesToShowArray[i] == 'false')
            continue;
        categories.push(allCategories[i])
    }
    console.log("allCategories:", allCategories);
    console.log("categoriesToShow:", categories);

    let datesAndPrices = []
    try {
        for (let i=0; i<categories.length; i++){
            const thisCategoryCoins = await get_coins_specific_category(categories[i][0]); 
            //카테고리 해당되는 코인들 삽입
            for (let j=0; j<thisCategoryCoins.length; j++) {
                categories[i][1].push(thisCategoryCoins[j].CoinSymbol)
            }
        }
         datesAndPrices = await return_calculated_prices_1d(categories, "1d") //계산된 가격 코인 별 불러오기 (기준 100으로 맞춤)
         res.send(datesAndPrices);
    } catch (error) {
        console.log(error);
        res.json({ message: error.message });        
    }
}

export const get_category_data_1mo = async (req, res) => {
    console.log("Categories to show 1mo:", req.query.categoryArray);
    const categoriesToShowArray = req.query.categoryArray; 
    console.log("categoriesToShowArray 1mo: ", categoriesToShowArray);

    let categories = [];
    for (let i=0; i<allCategories.length; i++) {
        if (categoriesToShowArray[i] == 'false')
            continue;
        categories.push(allCategories[i])
    }
    console.log("allCategories:", allCategories);
    console.log("categoriesToShow:", categories);

    let datesAndPrices = []
    try {
        for (let i=0; i<categories.length; i++){
            const thisCategoryCoins = await get_coins_specific_category(categories[i][0]);
            for (let j=0; j<thisCategoryCoins.length; j++) { 
                //카테고리 해당되는 코인들 삽입
                categories[i][1].push(thisCategoryCoins[j].CoinSymbol)
            }
        }
         datesAndPrices = await return_calculated_prices(categories, "1mo") //계산된 가격 코인 별 불러오기 (기준 100으로 맞춤)
         res.send(datesAndPrices);
    } catch (error) {
        console.log(error);
        res.json({ message: error.message });        
    }
}

export const get_category_data_1yr = async (req, res) => {
    console.log("Categories to show 1y:", req.query.categoryArray);
    const categoriesToShowArray = req.query.categoryArray; 
    console.log("categoriesToShowArray 1y: ", categoriesToShowArray);

    let categories = [];
    for (let i=0; i<allCategories.length; i++) {
        if (categoriesToShowArray[i] == 'false')
            continue;
        categories.push(allCategories[i])
    }
    console.log("allCategories:", allCategories);
    console.log("categoriesToShow:", categories);
    let datesAndPrices = [];
    try {
        for (let i=0; i<categories.length; i++){
            const thisCategoryCoins = await get_coins_specific_category(categories[i][0]);
            for (let j=0; j<thisCategoryCoins.length; j++) {
                //카테고리 해당되는 코인들 삽입
                categories[i][1].push(thisCategoryCoins[j].CoinSymbol)
            }
        }
         datesAndPrices = await return_calculated_prices(categories, "1y") //계산된 가격 코인 별 불러오기 (기준 100으로 맞춤)
         res.send(datesAndPrices);
    } catch (error) {
        console.log(error);
        res.json({ message: error.message });        
    }
}

//Insert ignore data to column of table
export const insert_ignore_to_db_table_column = async (tableName, columns, valuesList) => {
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
    const firstCategoryName = categories[0][0] + "_prices";
    let sql = "select DATE_FORMAT(`" + firstCategoryName + "`.date, '%Y-%m-%d') as time ";
    let sqlJoinTableList = "from `" + firstCategoryName + "`";
    for (let i=0; i<categories.length; i++) {
        const categoryTableName = categories[i][0] + "_prices"
        if (i > 0){
            sqlJoinTableList = sqlJoinTableList + " join `"+ categoryTableName +"` on `"+ firstCategoryName +"`.date = `"+ categoryTableName +"`.date";
        }
        const sqlToMerge = await sql_to_merge_category(categoryTableName, categories[i][1])
        sql = sql + sqlToMerge;
        }
        sql = sql + sqlJoinTableList;
        const today = await getToday();
        if (dateRange == "1y") {
        console.log("dateRange == 1y");
        sql = sql + " where `"+firstCategoryName+"`.date between DATE_ADD(DATE_ADD('"+ today +"', INTERVAL 1 DAY), INTERVAL -1 YEAR) and '"+ today + "' ";
        } else if (dateRange == "1mo"){
        console.log("dateRange == 1mo");
        sql = sql + " where `"+firstCategoryName+"`.date between DATE_ADD('"+ today +"', INTERVAL -1 MONTH) and '"+ today + "' ";
        } else {
        console.error("invalid date range in return_calculated_prices");
        }
    const connection = await mysql.createConnection
    ({
        host: MY_HOST,
        user: MY_USERNAME,
        password: MY_PASSWORD,
        database : MY_DATABASE,
    });
    const [rows, fields] = await connection.execute(sql);
    console.log("end query return_calculated_prices()");
    return rows;
}

// export const sql_to_merge_category = (tableName, coinList) => {
//     let sqlToMerge = ", round( ";
//     let categoryNameToReturn = tableName.slice(0, -7)
//     const coinNum = coinList.length;


//     for (let i=0; i<coinNum; i++) {
//         if (i==0) {
//             sqlToMerge = sqlToMerge + "IFNULL ((`"+coinList[i]+"` * 100 / (select `"+coinList[i]+"` from `"+tableName+"` LIMIT 0,1) / "+coinNum+"), 0)";
//         } else {
//             sqlToMerge = sqlToMerge + " + IFNULL ((`"+coinList[i]+"` * 100 / (select `"+coinList[i]+"` from `"+tableName+"` LIMIT 0,1) / "+coinNum+"), 0)";
//         }
//     }
//     sqlToMerge = sqlToMerge + ", 1) as `"+ categoryNameToReturn+"` ";
//     return sqlToMerge
// }

export const sql_to_merge_category = (tableName, coinList) => {
    let sqlToMerge = ", round( ";
    let categoryNameToReturn = tableName.slice(0, -7)
    const coinNum = coinList.length;
    const today = getToday();
    const queryUTCBefore1Month = "DATE_ADD('"+ today +"', INTERVAL -1 MONTH)"
    const queryUTCBefore364days = "DATE_ADD(DATE_ADD('"+ today +"', INTERVAL 1 DAY), INTERVAL -1 YEAR)"

    for (let i=0; i<coinNum; i++) {
        if (i==0) {
            sqlToMerge = sqlToMerge + "IFNULL ((`"+coinList[i]+"` * 100 / (select `"+coinList[i]+"` from `"+tableName+"` LIMIT 0,1) / "+coinNum+"), 0)";
            // sqlToMerge = sqlToMerge + "IFNULL ((`"+coinList[i]+"` * 100 / (select `"+coinList[i]+"` from `"+tableName+"` d where d.date > "" LIMIT 0,1) / "+coinNum+"), 0)";
        } else {
            sqlToMerge = sqlToMerge + " + IFNULL ((`"+coinList[i]+"` * 100 / (select `"+coinList[i]+"` from `"+tableName+"` LIMIT 0,1) / "+coinNum+"), 0)";
            // sqlToMerge = sqlToMerge + " + IFNULL ((`"+coinList[i]+"` * 100 / (select `"+coinList[i]+"` from `"+tableName+"` LIMIT 0,1) / "+coinNum+"), 0)";

        }
    }
    sqlToMerge = sqlToMerge + ", 1) as `"+ categoryNameToReturn+"` ";
    return sqlToMerge
}


export const sql_to_merge_category_1d = (tableName, coinList) => {
    let sqlToMerge = ", round( ";
    let categoryNameToReturn = tableName.slice(0, -14)
    const coinNum = coinList.length;
    // const queryUTCBefore23h = "DATE_FORMAT(DATE_ADD(utc_timestamp(), INTERVAL -23 HOUR), '%Y-%m-%dT%TZ')"
    const queryUTCBefore23h = "DATE_FORMAT(DATE_ADD(utc_timestamp(), INTERVAL -50 HOUR), '%Y-%m-%dT%TZ')"

    for (let i=0; i<coinNum; i++) {
        if (i==0) {
            sqlToMerge = sqlToMerge + "IFNULL ((`"+coinList[i]+"` * 100 / (select `"+coinList[i]+"` from `"+tableName+"` d where d.date > "+queryUTCBefore23h+" LIMIT 0,1) / "+coinNum+"), 0)";
        } else {
            sqlToMerge = sqlToMerge + " + IFNULL ((`"+coinList[i]+"` * 100 / (select `"+coinList[i]+"` from `"+tableName+"` d where d.date > "+queryUTCBefore23h+" LIMIT 0,1) / "+coinNum+"), 0)";
        }
    }
    sqlToMerge = sqlToMerge + ", 1) as `"+ categoryNameToReturn+"` ";
    console.log(sqlToMerge); 
    return sqlToMerge
}

export const return_calculated_prices_1d = async (categories, dateRange) => {
    const firstCategoryName = categories[0][0] + "_prices_hourly";
    // CONVERT_TZ(`" + firstCategoryName + "`.date,'+00:00','+09:00')
    // let sql = "select DATE_FORMAT(`" + firstCategoryName + "`.date, '%d' '%h') as time ";
    let sql = "select DATE_FORMAT(  CONVERT_TZ(`" + firstCategoryName + "`.date,'+00:00','+09:00') , '%h') as time ";
    let sqlJoinTableList = "from `" + firstCategoryName + "`";
    for (let i=0; i<categories.length; i++) {
        const categoryTableName = categories[i][0] + "_prices_hourly"
        if (i > 0){
            sqlJoinTableList = sqlJoinTableList + " join `"+ categoryTableName +"` on `"+ firstCategoryName +"`.date = `"+ categoryTableName +"`.date";
        }
        const sqlToMerge = await sql_to_merge_category_1d(categoryTableName, categories[i][1])
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
        console.error("invalid date range in return_calculated_prices");
        }
    const connection = await mysql.createConnection
    ({
        host: MY_HOST,
        user: MY_USERNAME,
        password: MY_PASSWORD,
        database : MY_DATABASE,
    });
    console.log("sql: ", sql);
    const [rows, fields] = await connection.execute(sql);
    console.log("end query return_calculated_prices()");
    console.log("rows: ", rows);
    return rows;
}
