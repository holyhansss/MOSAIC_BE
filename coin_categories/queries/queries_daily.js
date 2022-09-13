import mysql from 'mysql2/promise';
import {MY_HOST, MY_USERNAME, MY_PASSWORD, MY_DATABASE} from "../../config/database.js";
import {getHistoricalData} from "../api.js"

  
export const daily_update_to_db_table_column = async (tableName, columnName, date, newValue) => {
    //query to add newValue to tableName.date
    const sql = "update `"+tableName+"` set `"+columnName+"` = "+newValue+" where Date = '"+date+"'";
    const connection = await mysql.createConnection
    ({
      host: MY_HOST,
      user: MY_USERNAME,
      password: MY_PASSWORD,
      database : MY_DATABASE,
    });

    const [rows, fields] = await connection.query(sql);
    console.log("end query daily_update_to_db_table_column() for tableName "+tableName);
    return rows;
}

export const replaceToLatestValueAndSetIsNull = async (tableName, columnName, date) => {
    // if today's price value is null, replace it to yesterday's price value and set isNull to 1
    const sql = 
        "update `" + tableName + "` \
        set `" + columnName + "` = \
        (select  `"+columnName+"` from \
        (select `"+columnName+"` from `"+tableName+"` order by date desc limit 1 , 1) as C), \
        `isNull" + columnName + "` = 1\
        where date = '"+date+"'";

    // const sql = 
    //     "update `" + tableName + "` \
    //     set `" + columnName + "` = \
    //     (select `"+columnName+"` from `"+tableName+"` A order by A.date desc limit 1 , 1), \
    //     `isNull" + columnName + "` = 1\
    //     where date = '"+date+"'";
    
    // const sqlIsNull =
    //     "update `" + tableName + "` \
    //     set `isNull" + columnName + "` = 1\
    //     where date = '"+date+"'";

    console.log(sql);
    // console.log(sqlIsNull);

    const connection = await mysql.createConnection
    ({
        host: MY_HOST,
        user: MY_USERNAME,
        password: MY_PASSWORD,
        database : MY_DATABASE,
    });

    try {
        await connection.query(sql);
        // await connection.query(sqlIsNull);
    } catch (error) {
        console.log(error);
    }
    console.log("end query replaceToLatestValueAndSetIsNull() for tableName "+tableName);
    return;    
}