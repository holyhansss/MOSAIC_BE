import mysql from 'mysql2/promise';
import {MY_HOST, MY_USERNAME, MY_PASSWORD, MY_DATABASE} from "../config/database.js";
import {getHistoricalData} from "./api.js"

export const get_category_data_1d = async (req, res) => {
    let categories = 
    [
        [["Currency"],[]],                 
        [["Smart Contract Platform"] ,[]],
        [["Computing"] , []],
        [["DeFi"] , []],        
        [["Culture & Entertainment"] , []],
        [["Digitization"], []]
    ]
    let datesAndPrices = []
    try {
        for (let i=0; i<categories.length; i++){
            const thisCategoryCoins = await get_coins_specific_category(categories[i][0]);
            for (let j=0; j<thisCategoryCoins.length; j++) {
                categories[i][1].push(thisCategoryCoins[j].CoinSymbol)
            }
        }
        console.log(categories);
         datesAndPrices = await return_calculated_prices_1d(categories, "1d")
         console.log("try succeeded");
         res.send(datesAndPrices);
    } catch (error) {
        console.log(error);
        res.json({ message: error.message });        
    }
}

export const get_category_data_1mo = async (req, res) => {
    let categories = 
    [
        [["Currency"],[]],                 
        [["Smart Contract Platform"] ,[]],
        [["Computing"] , []],
        [["DeFi"] , []],        
        [["Culture & Entertainment"] , []],
        [["Digitization"], []]
    ]
    let datesAndPrices = []
    try {
        for (let i=0; i<categories.length; i++){
            const thisCategoryCoins = await get_coins_specific_category(categories[i][0]);
            for (let j=0; j<thisCategoryCoins.length; j++) {
                categories[i][1].push(thisCategoryCoins[j].CoinSymbol)
            }
        }
        console.log(categories);
         datesAndPrices = await return_calculated_prices(categories, "1mo")
         console.log("try succeeded");
         res.send(datesAndPrices);
    } catch (error) {
        console.log(error);
        res.json({ message: error.message });        
    }
}

export const get_category_data_1yr = async (req, res) => {
    let categories = 
    [
        [["Currency"],[]],                 
        [["Smart Contract Platform"] ,[]],
        [["Computing"] , []],
        [["DeFi"] , []],        
        [["Culture & Entertainment"] , []],
        [["Digitization"], []]
    ]
    let datesAndPrices = []
    try {
        for (let i=0; i<categories.length; i++){
            const thisCategoryCoins = await get_coins_specific_category(categories[i][0]);
            for (let j=0; j<thisCategoryCoins.length; j++) {
                categories[i][1].push(thisCategoryCoins[j].CoinSymbol)
            }
        }
        console.log(categories);
         datesAndPrices = await return_calculated_prices(categories, "1y")
         console.log("try succeeded");
         res.send(datesAndPrices);
    } catch (error) {
        console.log(error);
        res.json({ message: error.message });        
    }
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
        const today = getToday();
        if (dateRange == "1y") {
        console.log("dateRange == 1y");
        sql = sql + " where `Currency_prices`.date between DATE_ADD (DATE_ADD('"+ today +"', INTERVAL 1 DAY), INTERVAL -1 YEAR) and '"+ today + "' ";
        } else if (dateRange == "1mo"){
        console.log("dateRange == 1mo");
        sql = sql + " where `Currency_prices`.date between DATE_ADD('"+ today +"', INTERVAL -1 MONTH) and '"+ today + "' ";
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
    console.log(rows);
    return rows;
    }

  export const sql_to_merge_category = (tableName, coinList) => {
    let sqlToMerge = ", round( ";
    let categoryNameToReturn = tableName.slice(0, -7)
    const coinNum = coinList.length;


    for (let i=0; i<coinNum; i++) {
        if (i==0) {
            sqlToMerge = sqlToMerge + "IFNULL ((`"+coinList[i]+"` * 100 / (select `"+coinList[i]+"` from `"+tableName+"` LIMIT 0,1) / "+coinNum+"), 0)";
        } else {
            sqlToMerge = sqlToMerge + " + IFNULL ((`"+coinList[i]+"` * 100 / (select `"+coinList[i]+"` from `"+tableName+"` LIMIT 0,1) / "+coinNum+"), 0)";
        }
    }
    sqlToMerge = sqlToMerge + ", 1) as `"+ categoryNameToReturn+"` ";
    return sqlToMerge
}


export const sql_to_merge_category_1d = (tableName, coinList) => {
    let sqlToMerge = ", round( ";
    let categoryNameToReturn = tableName.slice(0, -14)
    const coinNum = coinList.length;
    const queryUTCBefore23 = "DATE_FORMAT(DATE_ADD(utc_timestamp(), INTERVAL -23 HOUR), '%Y-%m-%dT%TZ')"
    for (let i=0; i<coinNum; i++) {
        if (i==0) {
            sqlToMerge = sqlToMerge + "IFNULL ((`"+coinList[i]+"` * 100 / (select `"+coinList[i]+"` from `"+tableName+"` d where d.date > "+queryUTCBefore23+" LIMIT 0,1) / "+coinNum+"), 0)";
        } else {
            sqlToMerge = sqlToMerge + " + IFNULL ((`"+coinList[i]+"` * 100 / (select `"+coinList[i]+"` from `"+tableName+"` d where d.date > "+queryUTCBefore23+" LIMIT 0,1) / "+coinNum+"), 0)";
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
        const queryUTCBefore23 = "DATE_FORMAT(DATE_ADD(utc_timestamp(), INTERVAL -23 HOUR), '%Y-%m-%dT%TZ')"
    if (dateRange == "1d") {
        sql = sql + " where `Currency_prices_hourly`.date between " + queryUTCBefore23 +" and "+ queryUTCNow ;
        console.log("dateRange == 1d");
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

const getToday = () => {
    let today = new Date(new Date().setUTCDate(new Date().getUTCDate()));
    today = JSON.stringify(today)
    today = today.slice(1, -15);
    console.log(today);
    return today;
}


const getYesterdaySecondPlusMin = () => {

    let today = new Date(new Date().setUTCDate(new Date().getUTCDate()));//

    let yesterday = new Date(new Date().setUTCDate(new Date().getUTCDate()-1));
    let yesterdayMinus1Min = new Date(yesterday.getTime() + 60000);

    yesterdayMinus1Min = JSON.stringify(yesterdayMinus1Min)
    yesterdayMinus1Min = yesterdayMinus1Min.slice(1, -6);
    yesterdayMinus1Min = yesterdayMinus1Min + "Z"

    console.log(today);//
    console.log(yesterdayMinus1Min);
    return yesterdayMinus1Min;
}


export const create_category_history_hourly = async (categoryName) => {
    // let categories = 
    // [
    //     [["Currency"],[]],                 
    //     [["Smart Contract Platform"] ,[]],
    //     [["Computing"] , []],
    //     [["DeFi"] , []],        
    //     [["Culture & Entertainment"] , []],
    //     [["Digitization"], []]

    // ]

    await get_coins_specific_category(categoryName);
    const tableName = categoryName + "_prices_hourly"
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
    }
    sqlCreate = sqlCreate + ", CONSTRAINT PRIMARY KEY (Date) )"
    console.log(sqlCreate);
    console.log("end query create_category_history_hourly()");
    await connection.execute(sqlCreate);
  }

const get_24_hourly_time_list = async () => {
    let year = new Date().getUTCFullYear();
    let month = new Date().getUTCMonth();
    let date = new Date().getUTCDate();
    let hour = new Date().getUTCHours();
    let dateList = [];
    let utcDate = new Date(Date.UTC(year, month, date, hour, 0, 0));

    for(let i=0; i<24; i++){

        let thisDate = new Date(utcDate.getTime() - i * 60 * 60000 ) ;
        
        thisDate = JSON.stringify(thisDate)
        thisDate = thisDate.slice(1, -1);
        thisDate = thisDate.slice(0,-5) + 'Z';
        dateList.push([thisDate])
    }
    return dateList;
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
        [["Digitization"], []]
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



//update daily category coins data

// insert_time_data_hourly("Currency")
// insert_category_history_hourly("Currency");

// insert_time_data_hourly("Smart Contract Platform")
// insert_category_history_hourly("Smart Contract Platform");

// insert_time_data_hourly("Computing")
// insert_category_history_hourly("Computing");

// insert_time_data_hourly("DeFi")
// insert_category_history_hourly("DeFi");

// insert_time_data_hourly("Culture & Entertainment")
// insert_category_history_hourly("Culture & Entertainment");

// insert_time_data_hourly("Digitization")
// insert_category_history_hourly("Digitization");
