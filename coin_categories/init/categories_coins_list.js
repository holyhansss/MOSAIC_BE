import fetch from "node-fetch";
import axios from "axios";
import { insert_to_db_table, get_coindesk_coins} from "../queries/queries.js";
import {create_coindesk_table} from "../queries/queries_init.js"
import {getDataFromCoinpaprica} from "../api.js"

const initializeCategoryDb = async () => {
  const data_to_insert_to_db = await getDataFromCoinpaprica();
  try {
    await create_coindesk_table();    
  } catch (error) {
    console.log(error);
  }
  let insert_to_db = [];  
  console.log("data_to_insert_to_db[0].list[0]: ", data_to_insert_to_db[0].list[0]);
  
  for (let i=0; i<data_to_insert_to_db.length; i++){
    for (let j=0; j<data_to_insert_to_db[i].list.length; j++){
      insert_to_db.push(
        [
          data_to_insert_to_db[i].list[j].CoinSymbol, 
          data_to_insert_to_db[i].list[j]["CoinName"],
          data_to_insert_to_db[i].list[j].CoinPapricaID,
          data_to_insert_to_db[i].list[j]["Category"],
          data_to_insert_to_db[i].list[j]["Rank"]
        ]
      ); 
    }
  }
  console.log("insert_to_db[0]: ", insert_to_db[0]); 
  insert_to_db_table("categories_coins_list", insert_to_db);
}

let coinSectorList =  [
    {sector: 'Currency', list : []},
    {sector: 'Smart Contract Platform', list : []},
    {sector: 'Computing', list : [] },
    {sector: 'DeFi', list : [] },
    {sector: 'Culture & Entertainment', list : [] }
]

export async function sortCoindeskList  (current_coin_marketcap_list) {
  let coindeskResult = await get_coindesk_coins();
  let dataSorted = [];
  for (let i=0; i < coindeskResult.length; i++) {
    for (let j=0; j < current_coin_marketcap_list.length; j++) {
      if (coindeskResult[i].CoinSymbol == current_coin_marketcap_list[j].symbol){
        coindeskResult[i]["Rank"] = current_coin_marketcap_list[j].rank;     //
        coindeskResult[i].CoinPapricaID = current_coin_marketcap_list[j].id; // Inserting new keys and data Rank and CoinPaprikaID
        dataSorted.push(coindesk_coins_list[i]);
        break;
      }
    }
  }  
  let isAllFull = 0;
  for (let i = 0; i < dataSorted.length; i++) {
    for (let j = 0; j < coinSectorList.length; j++) {
      if (dataSorted[i].Category == coinSectorList[j].sector){
        if (coinSectorList[j].list.length < 10) {
          coinSectorList[j].list.push(dataSorted[i]);
          isAllFull ++;
        }        
        break;
      }   
    }
    if (isAllFull >= 50) {       
      break;
    }
  }
  return coinSectorList;
}