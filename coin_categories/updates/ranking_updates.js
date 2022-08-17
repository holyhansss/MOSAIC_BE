import {getDataFromCoinpaprica} from "../api.js"
import { get_categories_coins_sorted_by_rank, get_coindesk_coins } from "../queries/queries.js"


export const rankingUpdates = async () => {
    const currentCoins = await getDataFromCoinpaprica();
    const oldCategoryCoins = await get_categories_coins_sorted_by_rank();
    const updatedCoindeskList = await getUntillLowestRankingCoindeskCoin(currentCoins, oldCategoryCoins);
    // console.log("There are " + (updatedCoindeskList.length - 50) + " new coins in categories coins");
    const indexNotInCategory = await getIndexListNotInCategory(oldCategoryCoins, updatedCoindeskList);
    const coindeskCoins = await get_coindesk_coins();
    const newCoinsToAdd = await getCoinsToAssignCategory(indexNotInCategory, coindeskCoins);

}

const getIndexListNotInCategory = (oldCoinsList, updatedCoinsList) => {
    let list = []
    let missingRanks = 0; // looop through the oldCoinsList and add ranks that are not in the oldCoinsList[i].CoinsRank
    let x = -1;
    for (let i=0; i<oldCoinsList.length; i++){
        while (true) {
            missingRanks ++;
            if (oldCoinsList[i].CoinRank > missingRanks) {
                list.push(missingRanks);
            } else {
                break;
            }
        }
    }
    console.log("missing ranks list: ", list);
}

const getCoinsToAssignCategory = (indexesToCheck, listToCheckWith) => {
    
}

const getUntillLowestRankingCoindeskCoin = async (current_coin_marketcap_list, categoryCoins) => {

    let lowestRank = 0 ;
    let lowestRankIndex = 0;
  
    for (let i=0; i < categoryCoins.length; i++) {
        // Find lowest ranking coin in current coindeskCoins table
      for (let j=0; j < current_coin_marketcap_list.length; j++) {
        if (categoryCoins[i].CoinSymbol == current_coin_marketcap_list[j].symbol){
            if (lowestRank < current_coin_marketcap_list[j].rank) {
                lowestRank = current_coin_marketcap_list[j].rank;
                lowestRankIndex = j;
            }
          break;
        }
      }
    }  
    if (lowestRank==0){
        console.log("lowestRank cannot be 0");
        return;
    }
    const arrayToReturn = current_coin_marketcap_list.slice(lowestRankIndex+1)
    return arrayToReturn;
  }

rankingUpdates()