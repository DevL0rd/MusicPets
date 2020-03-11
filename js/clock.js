var hourPointer = document.querySelector('.hour'),
    minutePointer = document.querySelector('.minute'),
    secondPointer = document.querySelector('.second'),
    transform = getTransform();

function updateClock() {
    if (!paused) {
        var now = new Date(),
            second = now.getSeconds() * 6,
            minute = now.getMinutes() * 6 + (second / 60),
            hour = (((now.getHours() % 12) / 12) * 360) + (minute / 12);

        hourPointer.style[transform] = `rotate(${hour}deg)`;
        minutePointer.style[transform] = `rotate(${minute}deg)`;
        secondPointer.style[transform] = `rotate(${second}deg)`;
        minute = now.getMinutes();
        hour = now.getHours();
        var ampm = "AM"
        if (hour > 12) {
            hour -= 12;
            ampm = "PM";
        }
        if (minute < 10) {
            minute = "0" + minute
        }
        $(".clockText").html(hour + ":" + minute + " " + ampm);
        setTimeout(updateClock, 1000);
    }
}

function getTransform() {
    var style = document.createElement('div').style,
        transform,
        vendor;

    if (undefined !== style[vendor = 'webkitTransform']) {
        transform = vendor;
    }

    if (undefined !== style[vendor = 'msTransform']) {
        transform = vendor;
    }

    if (undefined !== style[vendor = 'transform']) {
        transform = vendor;
    }

    return transform;
}

