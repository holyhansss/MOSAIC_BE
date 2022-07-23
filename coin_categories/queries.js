import mysql from 'mysql2/promise';
import {MY_HOST, MY_USERNAME, MY_PASSWORD, MY_DATABASE} from "../config/database.js";


export const get_category_data = async (req, res) => {
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
                console.log(categories[i][1]);
            }
        }
        for (let i=0; i<categories.length; i++) {
            const categoryTableName = categories[i][0] + "_prices"
            if (i==0) { //get dates from the first categories table
                const dates = await return_dates(categoryTableName);
                datesAndPrices = datesAndPrices.concat(dates)
            }
            const thisPrices = await return_calculated_prices(categoryTableName, categories[i][1])
            // datesAndPrices.push(thisPrices)  
            datesAndPrices = datesAndPrices.concat(thisPrices)  
         }
         console.log("try succeeded");
         console.log(datesAndPrices);
         res.send(datesAndPrices);
    } catch (error) {
        console.log("try failed error");
        res.json({ message: error.message });        
    }
}

export const return_dates = async (tableName) => {
    let sql = "select DATE_FORMAT(date, '%Y-%m-%d') as time from `"+ tableName +"` ";
    const connection = await mysql.createConnection
    ({
      host: MY_HOST,
      user: MY_USERNAME,
      password: MY_PASSWORD,
      database : MY_DATABASE,
  });
    const [rows, fields] = await connection.execute(sql);
    console.log("end query return_dates()");
    console.log(rows);
    return rows;
}

export const return_calculated_prices = async (tableName, coinList) => {
    // let sql = "select DATE_FORMAT(date, '%Y-%m-%d') as time , round( ";
    let sql = "select round( ";
    let categoryNameToReturn = tableName.slice(0, -7)
    const coinNum = coinList.length
    for (let i=0; i<coinNum; i++) {
      if (i==0) {
        sql = sql + "IFNULL ((`"+coinList[i]+"` * 100 / (select `"+coinList[i]+"` from `"+tableName+"` LIMIT 0,1) / "+coinNum+"), 0)";
      } else {
        sql = sql + " + IFNULL ((`"+coinList[i]+"` * 100 / (select `"+coinList[i]+"` from `"+tableName+"` LIMIT 0,1) / "+coinNum+"), 0)";
      }
    }
    sql = sql + ", 1) as `"+ categoryNameToReturn+"` from `" + tableName +"`"; 
  
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


//   return_dates("Computing_prices");