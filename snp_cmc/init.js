import {create_SNPCMC_1d, create_SNPCMC_1mo, create_SNPCMC_1y,insert_to_db_table, select_data} from "./queries.js"
import {getData1mo,getData1y,getData1d} from "./api.js"

export const init_snpcmc = async () => {
    await create_SNPCMC_1d();
    await create_SNPCMC_1mo();
    await create_SNPCMC_1y();


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
    console.log("try succeeded init 1day data snp_cmc");
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
    console.log("try succeeded init 1mon data snp_cmc");

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
    console.log("try succeeded init 1yr data snp_cmc");
}

init_snpcmc()

