import axios from "axios";

export const getDataFromCoinpaprica = async () => {
  const options = {
    method: 'GET',
    url: 'https://api.coinpaprika.com/v1/tickers',
    params: {},
    headers: {}
  };  

  let la;  
  await axios.request(options)
    .then(
      async function (response) {  
        la = await sortCoindeskList(response.data);  
      }
    )
    .catch(
          function(error){
            console.log(error);
          }
      )
    return la;
}


export const getHistoricalData = async (coin_id, start_date, time_interval) => {
  
    const options = {
      method: 'GET',
      url: 'https://api.coinpaprika.com/v1/tickers/'+ coin_id +'/historical?start='+ start_date +'&interval='+time_interval,
      params: {},
      headers: {}
    };
  
    let result;
  
    await axios.request(options).then(function (response) {
        result = response.data
    }).catch(function (error) {
      console.error(error);
    });

    
  
    return result;
  }
