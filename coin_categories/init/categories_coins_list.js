
import axios from "axios";
import {insert_to_db_table, get_coindesk_coins} from "../queries/queries.js";
import {create_categories_coins_list} from "../queries/queries_init.js"
import {getDataFromCoinpaprica} from "../api.js"

export const initializeCategoryDb = async () => {
  try {
    await create_categories_coins_list();    
  } catch (error) {
    console.log(error);
  }
  const data_to_insert_to_db = await sortCoindeskList();
  let insert_to_db = [];  
  
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
  insert_to_db_table("categories_coins_list", insert_to_db);
}


export async function sortCoindeskList  () {

  let coinSectorList =  [
    {sector: 'Currency', list : []},
    {sector: 'Smart Contract Platform', list : []},
    {sector: 'Computing', list : [] },
    {sector: 'DeFi', list : [] },
    {sector: 'Culture & Entertainment', list : [] }
  ]

  const current_coin_marketcap_list = await getDataFromCoinpaprica();
  let coindeskResult = await get_coindesk_coins();
  let dataSorted = [];

  for (let i=0; i < coindeskResult.length; i++) {
    for (let j=0; j < current_coin_marketcap_list.length; j++) {
      if (coindeskResult[i].CoinSymbol == current_coin_marketcap_list[j].symbol){
        if (coindeskResult[i].IgnoreThis == 0) {
          //if stablecoin do not add to categorycoinslist
          coindeskResult[i]["Rank"] = current_coin_marketcap_list[j].rank;     //
          coindeskResult[i].CoinPapricaID = current_coin_marketcap_list[j].id; // Inserting new keys and data Rank and CoinPaprikaID
          dataSorted.push(coindeskResult[i]); 
        }
        break;
      }
    }
  }  
  dataSorted.sort((a, b) => a["Rank"] - b["Rank"]);

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