import axios from "axios";
import {COIN_API_KEY} from "../config/database.js";

//SNP 호출
async function getSNP(datacall) {
  let returnValue;
  await axios.request(datacall)
  .then((res,any) => {
      const IndexData = res.data.chart.result[0].indicators.quote[0].close.map((data, index) => (
        data && {
          time:res.data.chart.result[0].timestamp[index],
          SnP: data
        }))
      var SNP_first=IndexData[0].SnP
      for (let i=0;i<IndexData.length; i++){
        if (IndexData[0] == null ){
              for (let j = 0; ; j++) {
                if (IndexData[j] == null)
                  continue;
                IndexData[0]= IndexData[j];
                break;
              } 
          }
          else if (IndexData[i] == null  ) {
            IndexData[i]= {time: null, SnP: null};
            IndexData[i].time = IndexData[i-1].time+86400;
            IndexData[i].SnP= IndexData[i-1].SnP
            //IndexData2[i].CMC= ((IndexData2[i+1].CMC+IndexData2[i-1].CMC)/2) -  평균값일 경우
          } 
          else{  
          };  
      }
    for (const item of IndexData){  
          item.SnP=100/SNP_first*item.SnP
      }
      returnValue = IndexData
    });
  return returnValue
};
//CMC 호출
async function getCMC(datacall) {
  let returnValue;
  await axios.request(datacall)
    .then((res, any) => {
        const IndexData2 = res.data.chart.result[0].indicators.quote[0].close.map((data, index) => (
          data && {
            time:res.data.chart.result[0].timestamp[index],
            CMC: data
          }))

        var CMC_first=IndexData2[0].CMC
        for (let i=0;i<IndexData2.length; i++){
          if (IndexData2[0] == null ){
                for (let j = 0; ; j++) {
                  if (IndexData2[j] == null)
                    continue;
                  IndexData2[0]= IndexData2[j];
                  break;
                }   
            }
            else if (IndexData2[i] == null  ) {
              IndexData2[i]= {time: null, CMC: null};
              IndexData2[i].time = IndexData2[i-1].time+86400;
              IndexData2[i].CMC= IndexData2[i-1].CMC
              //IndexData2[i].CMC= ((IndexData2[i+1].CMC+IndexData2[i-1].CMC)/2) -  평균값일 경우
            } 
            else{  
            };  
        }
  for (const item of IndexData2){      
      item.CMC=100/CMC_first*item.CMC
      }
      returnValue = IndexData2
    });
  
  return returnValue
};
// 호출 Method
let SNPOptions_1mo = {
  method: 'GET',
  url: "https://yfapi.net/v8/finance/chart/^GSPC?comparisons=MSFT%2C%5EVIX&range=1mo&region=US&interval=1d&lang=en&events=div%2Csplit",
  params: {
    modules: 'defaultKeyStatistics,assetProfile', 
},
  headers: {
    'x-api-key': COIN_API_KEY
  }
};

let CMCOptions_1mo = {
  method: 'GET',
  url: "https://yfapi.net/v8/finance/chart/^CMC200?comparisons=MSFT%2C%5EVIX&range=1mo&region=US&interval=1d&lang=en&events=div%2Csplit",
  params: {

    modules: 'defaultKeyStatistics,assetProfile', 

},
  headers: {
    'x-api-key': COIN_API_KEY
  }
};

var SNPOptions_1y = {
  method: "GET",
  url: "https://yfapi.net/v8/finance/chart/^GSPC?comparisons=MSFT%2C%5EVIX&range=1y&region=US&interval=1d&lang=en&events=div%2Csplit",

  params: {
    modules: "defaultKeyStatistics,assetProfile",
  },
  headers: {
    "x-api-key": COIN_API_KEY,
  },
};
var CMCOptions_1y = {
  method: "GET",
  url: "https://yfapi.net/v8/finance/chart/^CMC200?comparisons=MSFT%2C%5EVIX&range=1y&region=US&interval=1d&lang=en&events=div%2Csplit",

  params: {
    modules: "defaultKeyStatistics,assetProfile",
  },
  headers: {
    "x-api-key": COIN_API_KEY,
  },
};

var SNPOptions_1d = {
  method: "GET",
  url: "https://yfapi.net/v8/finance/chart/^GSPC?comparisons=MSFT%2C%5EVIX&range=1d&region=US&interval=1m&lang=en&events=div%2Csplit",

  params: {
    modules: "defaultKeyStatistics,assetProfile",
  },
  headers: {
    "x-api-key": COIN_API_KEY,
  },
};
var CMCOptions_1d = {
  method: "GET",
  url: "https://yfapi.net/v8/finance/chart/^CMC200?comparisons=MSFT%2C%5EVIX&range=1d&region=US&interval=1m&lang=en&events=div%2Csplit",

  params: {
    modules: "defaultKeyStatistics,assetProfile",
  },
  headers: {
    "x-api-key": COIN_API_KEY,
  },
};

//SNP CMC 데이터 1mo Merge
export const getData1mo = async () => {
  const resTemp=[];
  const data1 = await getSNP(SNPOptions_1mo);
  const data2 = await getCMC(CMCOptions_1mo);
  //console.log(data1);
  //console.log(data2);

  for (let i =0; i< data1.length; i++){
  
    resTemp.push({
        time:data1[i].time,
        SnP:data1[i].SnP,
        CMC:data2[i].CMC,
    });
    }
  console.log("res: ", resTemp);
  return resTemp;
}

////SNP CMC 데이터 1year Merge
export const getData1y = async () => {
  const resTemp=[];
  const data1 = await getSNP(SNPOptions_1y);
  const data2 = await getCMC(CMCOptions_1y);
  //console.log(data1);
  // console.log(data2);

  for (let i =0; i< data1.length; i++){
  
    resTemp.push({
        time:data1[i].time,
        SnP:data1[i].SnP,
        CMC:data2[i].CMC,
    });
    }
  console.log("res: ", resTemp);
  return resTemp;
}
async function getSNP_1d(datacall) {
  let returnValue;
  await axios.request(datacall)
  .then((res,any) => {
      const IndexData = res.data.chart.result[0].indicators.quote[0].close.map((data, index) => (
        data && {
          time:res.data.chart.result[0].timestamp[index]+32400,
          SnP: data
        }))
        
      var SNP_first=IndexData[0].SnP
      for (let i=0;i<IndexData.length; i++){
        if (IndexData[0] == null ){
              for (let j = 0; ; j++) {
                if (IndexData[j] == null)
                  continue;
                IndexData[0]= IndexData[j];
                break;
              } 
          }
          else if (IndexData[i] == null  ) {
            IndexData[i]= {time: null, SnP: null};
            IndexData[i].time = IndexData[i-1].time+60;
            IndexData[i].SnP= IndexData[i-1].SnP
            //IndexData2[i].CMC= ((IndexData2[i+1].CMC+IndexData2[i-1].CMC)/2) -  평균값일 경우
          } 
          else{  
          };  
      }
      for (const item of IndexData){  
        item.SnP=100/SNP_first*item.SnP
      }
      returnValue = IndexData
    });
  return returnValue
};
//CMC 호출
async function getCMC_1d(datacall) {
  let returnValue;
  await axios.request(datacall)
    .then((res, any) => {
        const IndexData2 = res.data.chart.result[0].indicators.quote[0].close.map((data, index) => (
          data && {
            time:res.data.chart.result[0].timestamp[index]+32400,
            CMC: data
          }))
        
        var CMC_first=IndexData2[0].CMC
        for (let i=0;i<IndexData2.length; i++){
          if (IndexData2[0] == null ){
                for (let j = 0; ; j++) {
                  if (IndexData2[j] == null)
                    continue;
                  IndexData2[0]= IndexData2[j];
                  break;
                }   
            }
            else if (IndexData2[i] == null  ) {
              IndexData2[i]= {time: null, CMC: null};
              IndexData2[i].time = IndexData2[i-1].time+60;
              IndexData2[i].CMC= IndexData2[i-1].CMC
              //IndexData2[i].CMC= ((IndexData2[i+1].CMC+IndexData2[i-1].CMC)/2) -  평균값일 경우
            } 
            else{  
            };  
        }
        for (const item of IndexData2){      
          item.CMC=100/CMC_first*item.CMC
          }
      
       
      returnValue = IndexData2
    });
  
  return returnValue
};

export const getData1d = async () => {
  const resTemp=[];
  const data1 = await getSNP_1d(SNPOptions_1d);
  const data2 = await getCMC_1d(CMCOptions_1d);
  //console.log(data1);
  //console.log(data2);

  for (let i =0; i< data1.length; i++){
  
    resTemp.push({
        time:data1[i].time,
        SnP:data1[i].SnP,
        CMC:data2[i].CMC,
    });
    }
  
  console.log("res: ", resTemp);
  return resTemp;
}

//getData1d()
//getData1mo()
//getData1y()