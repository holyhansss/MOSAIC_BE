export const getToday = () => {
    let today = new Date(new Date().setUTCDate(new Date().getUTCDate()));
    today = JSON.stringify(today)
    today = today.slice(1, -15);
    console.log(today);
    return today;
}

export const getYesterdaySecondPlusMin = () => {
    let yesterday = new Date(new Date().setUTCDate(new Date().getUTCDate()-1));
    let yesterdayMinus1Min = new Date(yesterday.getTime() + 60000);
    yesterdayMinus1Min = JSON.stringify(yesterdayMinus1Min)
    yesterdayMinus1Min = yesterdayMinus1Min.slice(1, -6);
    yesterdayMinus1Min = yesterdayMinus1Min + "Z"
    console.log(yesterdayMinus1Min);
    return yesterdayMinus1Min;
}

export const get_24_hourly_time_list = () => {
    let year = new Date().getUTCFullYear();
    let month = new Date().getUTCMonth();
    let date = new Date().getUTCDate();
    let hour = new Date().getUTCHours();
    let dateList = [];
    let utcDate = new Date(Date.UTC(year, month, date, hour, 0, 0));
    for(let i=0; i<24; i++){
        let thisDate = new Date(utcDate.getTime() - i * 60 * 60000 ) ;
        thisDate = JSON.stringify(thisDate)
        thisDate = thisDate.slice(1, -1);
        thisDate = thisDate.slice(0,-5) + 'Z';
        dateList.push([thisDate])
    }
    return dateList;
}

export const get_364days_before = () => {
    let dateToReturn = new Date(new Date().setUTCDate(new Date().getUTCDate()-364));
    dateToReturn = JSON.stringify(dateToReturn)
    dateToReturn = dateToReturn.slice(1, -15);
    console.log(dateToReturn);
    return dateToReturn;
}