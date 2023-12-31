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
const shopOpenOrClose = (currDayObj, today, currTime, dayNames) => {
    if(!currDayObj.day === dayNames[today]) {
        return false;
    }

    const shopOpenTime = formatAMPM(currDayObj.open);
    const shopCloseTime = formatAMPM(currDayObj.close);

    if(!(currTime.hour >= shopOpenTime.hour && currTime.hour <= shopCloseTime.hour)) {
        return false;
    }
    if(currTime.hour === shopOpenTime.hour && currTime.minute < shopOpenTime.minute) {
        return false;
    }
    if(currTime.hour === shopCloseTime.hour && currTime.minute > shopOpenTime.minute) {
        return false;
    }
    
    return true;
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

    let status = false;
    days.forEach( currDayObj => {
        status = shopOpenOrClose(currDayObj, today, currTime, dayNames);
        if(status) {
            return;
        }
    });

    return status ? '=> Open' : '=> Closed';
}
console.log(startApp());