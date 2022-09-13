import {getDataFromCoinpaprica} from "../api.js"
import { get_categories_coins_sorted_by_rank, get_coindesk_coins } from "../queries/queries.js"


export const rankingUpdates = async () => {
    // return new coins to assign category and add to the coindesk table
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
    // currentCoinsSliced list 중에 coindeskCoins list 에 없는 코인들을 return
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
    //  현재 category coins list에 있는 코인중에 제일 순위가 낮은 코인을 기준부터 제일 순위가 높은 코인까지 나열한 리스트를 리턴한다
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

// rankingUpdates()