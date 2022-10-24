import {create_SNPCMC_1d, create_SNPCMC_1mo, create_SNPCMC_1y,insert_to_db_table, select_data,delete_data} from "./queries.js"
import {getData1mo,getData1y,getData1d} from "./api.js"

// 하루 데이터 호출/생성/저장
export const control_queries_1d = async () => {
    //await create_SNPCMC_1d();
    await delete_data("snpcmc_1d")
    let update_data_1d=[];
    let data_1d=[];
    data_1d=await getData1d();
    for (let i=0; i<data_1d.length; i++){
        update_data_1d.push([
            data_1d[i].time,
            data_1d[i].SnP,
            data_1d[i].CMC]
        )
    }
    await insert_to_db_table("snpcmc_1d",update_data_1d);
}

// 1개월치 데이터 호출/생성/저장
export const control_queries_1mo = async () => {
    //await create_SNPCMC_1mo();
    await delete_data("snpcmc_1mo")
    let update_data_1mo=[];
    let data_1mo=[];
    data_1mo=await getData1mo();
    for (let i=0; i<data_1mo.length; i++){
        update_data_1mo.push([
            data_1mo[i].time,
            data_1mo[i].SnP,
            data_1mo[i].CMC]
        )
    }
    await insert_to_db_table("snpcmc_1mo",update_data_1mo);
}

// 1년치 데이터 호출/생성/저장
export const control_queries_1y = async () => {
    //await create_SNPCMC_1y();
    await delete_data("snpcmc_1y")
    let update_data_1y=[]; //쿼리에 최종적으로 들어가기 위한 데이터
    let data_1y=[];
    data_1y=await getData1y(); //API 데이터 불러오기
    for (let i=0; i<data_1y.length; i++){
        update_data_1y.push([
            data_1y[i].time,
            data_1y[i].SnP,
            data_1y[i].CMC]
        )
    }
    await insert_to_db_table("snpcmc_1y",update_data_1y); //쿼리에 데이터 넣기
}

//하루 SNPCMC 데이터 불러오는 함수
export const get_snpcmc_data_1d = async (req, res) => {
    let data_1d=[]
    try {    
         data_1d = await select_data("snpcmc_1d") //쿼리 선택 후 불러오기
         console.log("try succeeded");
         res.send(data_1d);
    } catch (error) {
        console.log(error);
        res.json({ message: error.message });        
    }
}

//1개월 SNPCMC 데이터 불러오는 함수
export const get_snpcmc_data_1mo = async (req, res) => {
    let data_1mo=[]
    update_queries_1mo();
    try {    
         data_1mo = await select_data("snpcmc_1mo") //쿼리 선택 후 불러오기
         console.log("try succeeded select");
         res.send(data_1mo);
    } catch (error) {
        console.log(error);
        res.json({ message: error.message });        
    }
}
//1년 SNPCMC 데이터 불러오는 함수
export const get_snpcmc_data_1yr = async (req, res) => {
    let data_1yr=[]
    update_queries_1yr();
    try {
        
         data_1yr = await select_data("snpcmc_1y") //쿼리 선택 후 불러오기
         console.log("try succeeded");
         res.send(data_1yr);
    } catch (error) {
        console.log(error);
        res.json({ message: error.message });        
    }
}

// 자동화 함수 : 1yr
export const update_queries_1yr = async (req, res) => {
    let data_1yr=[]
    let last=[];
    let now_timestamp=0;
    let value=0;

    try {
        
         data_1yr = await select_data("SNPCMC_1y") //쿼리 선택 후 불러오기
         console.log("try succeeded");
         last= data_1yr.slice(-1)[0]//가장 최근 데이터 값
         console.log("last",last);
    } catch (error) {
        console.log(error);
        res.json({ message: error.message });        
    }
    
    now_timestamp= (Date.now() / 1000) | 0; 
    value= Math.abs(last.Time-now_timestamp );


    if (value>=86400){
        await delete_data("SNPCMC_1y")
        let update_data_1y=[]; //쿼리에 최종적으로 들어가기 위한 데이터
        let data_1y=[];
        data_1y=await getData1y(); //API 데이터 불러오기
        for (let i=0; i<data_1y.length; i++){
            update_data_1y.push([
                data_1y[i].time,
                data_1y[i].SnP,
                data_1y[i].CMC]
            )
        }
        await insert_to_db_table("SNPCMC_1y",update_data_1y); //쿼리에 데이터 넣기
        console.log("Update snpcmc 1yr")
    }else if (value<86400){
        console.log("No Update")
    }
}

// 자동화 함수 : 1mo
export const update_queries_1mo = async (req, res) => {
    let data_1mo=[]
    let last=[];
    let now_timestamp=0;
    let value=0;

    try {
        
         data_1mo = await select_data("SNPCMC_1mo") //쿼리 선택 후 불러오기
         console.log("try succeeded");
         last= data_1mo.slice(-1)[0] //가장 최근 데이터 값
         console.log("last",last);
    } catch (error) {
        console.log(error);
        res.json({ message: error.message });        
    }

    now_timestamp= (Date.now() / 1000) | 0; 
    value= Math.abs(last.Time-now_timestamp );


    if (value>=86400){
        await delete_data("SNPCMC_1mo")
        let update_data_1mo=[]; //쿼리에 최종적으로 들어가기 위한 데이터
        let data_1mo=[];
        data_1mo=await getData1mo(); //API 데이터 불러오기
        for (let i=0; i<data_1mo.length; i++){
            update_data_1mo.push([
                data_1mo[i].time,
                data_1mo[i].SnP,
                data_1mo[i].CMC]
            )
        }
        await insert_to_db_table("SNPCMC_1mo",update_data_1mo); //쿼리에 데이터 넣기

    }else if (value<86400){
        console.log("No Update")
    }
}


//실행 함수
// control_queries_1d();
// control_queries_1mo();
// control_queries_1y();
