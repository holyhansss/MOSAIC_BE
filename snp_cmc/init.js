import { create_SNPCMC_1d, create_SNPCMC_1mo, create_SNPCMC_1y, insert_to_db_table, select_data, delete_data } from "./queries.js"
import { getData1mo, getData1y, getData1d } from "./api.js"

export const init_snpcmc_data = async () => {
    //create table
    await create_SNPCMC_1d();
    await create_SNPCMC_1mo();
    await create_SNPCMC_1y();

    //get data
    data_1d = await getData1d();
    data_1mo = await getData1mo();
    data_1y = await getData1y(); //API 데이터 불러오기

    //insert data
    await insert_to_db_table("snpcmc_1d", update_data_1d);
    await insert_to_db_table("snpcmc_1mo", update_data_1mo);
    await insert_to_db_table("snpcmc_1y", update_data_1y);

    console.log("init_snpcmc_data()");
}