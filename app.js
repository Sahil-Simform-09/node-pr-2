const fs = require('fs');

const formatAMPM = ShopTime => {
    const [timePart, meridiem] = ShopTime.split(' ');
    let [hour, minute] = timePart.split(':');

    hour = Number(hour);
    minute = Number(minute);
    if(meridiem === 'PM' && hour !== 12) {
        hour += 12;
    } else if(meridiem === 'AM' && hour === 12){
        hour = 0;
    }

    return {hour, minute};
}
const shopOpenOrClose = (shopOpenTime, shopCloseTime, eachDay, today, currTime) => {
    if(!(eachDay === today)) {
        //console.log(eachDay, ' ', today);
        return false;
    }

    if(!(currTime.hour >= shopOpenTime.hour && currTime.hour <= shopCloseTime.hour)) {
        //console.log('check hour', currTime.hour + ' ' + shopOpenTime.hour + ' ' + shopCloseTime.hour);
        return false;
    }
    if(currTime.hour === shopOpenTime.hour && currTime.minute < shopOpenTime.minute) {
        //console.log('minute');
        return false;
    }
    if(currTime.hour === shopCloseTime.hour && currTime.minute > shopOpenTime.minute) {
        //console.log('minute');
        return false;
    }
    
    return true;
}
const createTempDays = (days, dayNames) => {
    const tempDays = [];
    let i = 0, j = 0;
    while(i < days.length && j < dayNames.length) {
        if(days[i].day === dayNames[j]) {
            tempDays[j] = {
                day: dayNames[j],
                isLeave: false,
            }
            i++;
        } else {
            tempDays[j] = {
                day: dayNames[j],
                isLeave: true,
            } 
        }
        j++;
    }
    while(j < dayNames.length) {
        tempDays[j] = {
            day: dayNames[j],
            isLeave: true
        }
        j++; 
    }
    return tempDays;
}
const countRemainHours = (i, tempDays, days, flag, remainHours, today, currTime) => {
    while(i < tempDays.length) {
        console.log(remainHours);
        if(tempDays[i].isLeave) {
            remainHours += 24;
            i++;
        } else { 
            flag = true;
            const shopOpenDay = days.find( aDay => {
                return aDay.day === tempDays[i].day;
            });
            const shopOpenTime = formatAMPM(shopOpenDay.open);
            remainHours += shopOpenTime.hour;
            return {remainHours, flag};
        }
    }

    return {remainHours, flag};
}
const whenShopOpen = (currTime, today, days, dayNames, shopStatus) => {
    // assuming json file is sorted according days
    const tempDays = createTempDays(days, dayNames, shopStatus);
    const index = tempDays.findIndex( aDay => {
        return aDay.day === today;
    });

    let i = index,remainHours = 0, flag = false;
    remainHours = 24 - currTime.hour; 
    i++; 

    const remainHoursObj = countRemainHours(i, tempDays, days, flag, remainHours, today, currTime);
    remainHours = remainHoursObj.remainHours;

    if(!remainHoursObj.flag) {
        remainHours = countRemainHours(0 , tempDays, days, flag, remainHours, today, currTime).remainHours;
    }
    return remainHours;
}
const whenShopClose = (currTime, shopCloseTime) => {
    return shopCloseTime.hour - currTime.hour;;
}
const startApp = () => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wen', 'Thu', 'Fri', 'Sat'];
    const buffer =  fs.readFileSync('scedule.json');
    const days = JSON.parse(buffer);

    const date = new Date();
    const today = date.getDay();
    const currTime = {
        hour: date.getHours(),
        minute: date.getMinutes()  
    }

    let shopStatus = false;
    let messsage = '';
    for(let i = 0; i < days.length; i++) {
        const eachDayObj = days[i];
        const shopOpenTime = formatAMPM(eachDayObj.open);
        const shopCloseTime = formatAMPM(eachDayObj.close);

        shopStatus = shopOpenOrClose(shopOpenTime, shopCloseTime, eachDayObj.day, dayNames[today], currTime);
        if(shopStatus) {
            const remainCloseTime = whenShopClose(currTime, shopCloseTime);
            messsage = `Open, The shop will be closed within ${remainCloseTime} Hrs`
            return messsage;
        }
    }


    const remainOpenTime = whenShopOpen(currTime, dayNames[today], days, dayNames, shopStatus);
    return remainOpenTime;
}
console.log(startApp());