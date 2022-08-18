import mysql from 'mysql2/promise';
import {MY_HOST, MY_USERNAME, MY_PASSWORD, MY_DATABASE} from "../config/database2.js";

//CREATE TABLE; SNPCMC_1d

export const create_SNPCMC_1d = async () => {
  let sql = "CREATE TABLE SNPCMC_1d ( Time varchar(10), SNP varchar(50), CMC varchar(50))"
  const connection = await mysql.createConnection
    ({
        host: MY_HOST,
        user: MY_USERNAME,
        password: MY_PASSWORD,
        database : MY_DATABASE,
    });
  const [rows, fields] = await connection.execute(sql);
  console.log("end query create_SNPCMC()");
  return rows;}

//CREATE TABLE; SNPCMC_1mo

export const create_SNPCMC_1mo = async () => {
  let sql = "CREATE TABLE SNPCMC_1mo ( Time varchar(10), SNP varchar(50), CMC varchar(50))"
  const connection = await mysql.createConnection
    ({
        host: MY_HOST,
        user: MY_USERNAME,
        password: MY_PASSWORD,
        database : MY_DATABASE,
    });
  const [rows, fields] = await connection.execute(sql);
  console.log("end query create_SNPCMC()");
  return rows;}

//CREATE TABLE; SNPCMC_1y
export const create_SNPCMC_1y = async () => {
    let sql = "CREATE TABLE SNPCMC_1y ( Time varchar(10), SNP varchar(50), CMC varchar(50))"
    const connection = await mysql.createConnection
      ({
          host: MY_HOST,
          user: MY_USERNAME,
          password: MY_PASSWORD,
          database : MY_DATABASE,
      });
    const [rows, fields] = await connection.execute(sql);
    console.log("end query create_SNPCMC()");
    return rows;}

//insert TABLE;
export const insert_to_db_table = async (tableName, valuesList) => {
    let sql = 'INSERT INTO `' + tableName + '` VALUES ?'; 
    //console.log(valuesList);
    const connection = await mysql.createConnection
    ({
      host: MY_HOST,
      user: MY_USERNAME,
      password: MY_PASSWORD,
      database : MY_DATABASE,
  });
    const [rows, fields] = await connection.query(sql, [valuesList]);
    console.log("end query insert_to_db_table()");
    return rows;
  }

// 테이블 데이터 정보 선택
  export const select_data = async (tableName) => {
    let sql = 'SELECT * from `' + tableName + '`'; 
    const connection = await mysql.createConnection
    ({
      host: MY_HOST,
      user: MY_USERNAME,
      password: MY_PASSWORD,
      database : MY_DATABASE,
  });
    const [rows, fields] = await connection.execute(sql);
    console.log("end query select_data()");
    console.log("rows: ", rows);
    return rows;
  }

  // 테이블 데이터 정보 삭제
  export const delete_data = async (tableName) => {
    let sql = 'DELETE from `' + tableName + '`'; 
    const connection = await mysql.createConnection
    ({
      host: MY_HOST,
      user: MY_USERNAME,
      password: MY_PASSWORD,
      database : MY_DATABASE,
  });
    const [rows, fields] = await connection.execute(sql);
    console.log("end query delete_data()");
    console.log("rows: ", rows);
    return rows;
  }


  