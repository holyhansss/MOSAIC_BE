import {getDataFromCoinpaprica} from "../api.js"
import { get_categories_coins_sorted_by_rank, get_coindesk_coins } from "../queries/queries.js"


export const rankingUpdates = async () => {
    const currentCoins = await getDataFromCoinpaprica();
    const oldCategoryCoins = await get_categories_coins_sorted_by_rank();
    const currentCoinsSliced = await getUntillLowestRankingCoindeskCoin(currentCoins, oldCategoryCoins);
    const coindeskCoins = await get_coindesk_coins();
    const newCoinsToAdd = await getCoinsToAssignCategory(currentCoinsSliced, coindeskCoins);

    console.log("Coins to add to coindesklist: ");
    console.log(newCoinsToAdd[1]);
    for (let i=0; i<newCoinsToAdd.length; i++) {
        console.log(newCoinsToAdd[i].symbol + " / " + newCoinsToAdd[i].name);
    }
    return newCoinsToAdd;
}

const getCoinsToAssignCategory = (currentCoinsSliced, coindeskCoins) => {
    let coinWasFound = 0;
    let list = [];
    for (let i=0; i<currentCoinsSliced.length; i++) {
        for (let j=0; j<coindeskCoins.length; j++) {
            if (currentCoinsSliced[i].symbol == coindeskCoins[j].CoinSymbol) {
                coinWasFound = 1;
                break;
            }
        }
        if (coinWasFound == 0){
            list.push(
                currentCoinsSliced[i]
            )
        }
        coinWasFound = 0;
    }
    return list;
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
    console.log("lowestRankIndex: "+ lowestRankIndex);

    const arrayToReturn = current_coin_marketcap_list.slice(0, lowestRankIndex+1)
    return arrayToReturn;
  }

rankingUpdates()
