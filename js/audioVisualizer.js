var bgReactionStrength = 15;
var soundReaction = true;
var visRainbow = false;
var soundSamplePoint = 10;
var soundDataCache = [];
var autoGrayscale = false;
var autoBlur = false;
var autoHueRotate = false;
var autoSepia = false;
var reactionLowPass = 15
var smoothPasses = 3;
var tween = 60;
var normalizationSpeed = 99;
var mirroredMode = false;
function audioListener(soundData) {
    //128 data points in this
    // $("#testOut").html(soundData[0])
    if (!paused) {
        soundData = correctWithPinkNoiseResults(soundData);
        if (mirroredMode) {
            soundData = mirrorChannels(soundData);
        } else {
            soundData = mergeChannels(soundData);
        }
        soundDataCache = processAudioData(soundData);
    }
}
function renderVis() {
    if (!paused) {
        soundDataCache = tweenData(soundDataCache);
        updateGraph(soundDataCache);
        if (soundReaction) {
            react(soundDataCache);
        }
    }
    requestAnimationFrame(renderVis);
}
function react(soundData) {
    var averagedScale = (soundData[soundSamplePoint - 1] + soundData[soundSamplePoint] + soundData[soundSamplePoint + 1]) / 3

    if ((averagedScale * 100) > reactionLowPass) { //get reactions only in this range
        averagedScale -= reactionLowPass / 100;
        $("#background-canvas").css({
            "transform": "scale(" + (1 + (averagedScale / bgReactionStrength)) + ")"
        })
        //HW Accelerated
        // $("#background-canvas").css({
        //     "-webkit-transform": "translate3d(0, 0, " + (1 + (averagedScale / bgReactionStrength)) + ")"
        // })
        if (autoGrayscale) {
            $("#grayscale").css({
                "filter": "grayscale(" + (averagedScale) + ")"
            })
        }
        if (autoBlur) {
            $("#background-canvas").css({
                "filter": "blur(" + (averagedScale) * 5 + "px)"
            });
        }
        if (autoHueRotate) {
            $("#huerotation").css({
                "filter": "hue-rotate(" + (averagedScale) * 182 + "deg)"
            })
        }
        if (autoSepia) {
            $("#sepia").css({
                "filter": "sepia(" + (averagedScale) + ")"
            })
        }

    } else {
        $("#background-canvas").css({
            "transform": "none"
        })
        if (autoGrayscale) {
            $("#grayscale").css({
                "filter": "none"
            })
        }
        if (autoBlur) {
            $("#background-canvas").css({
                "filter": "none"
            });
        }
        if (autoHueRotate) {
            $("#huerotation").css({
                "filter": "none"
            })
        }
        if (autoSepia) {
            $("#sepia").css({
                "filter": "none"
            })
        }
    }
}
function mirrorChannels(soundData) {
    var half_length = Math.ceil(soundData.length / 2);
    var leftSide = soundData.splice(0, half_length);
    var rightSide = soundData;
    var rightFlipped = rightSide.reverse();
    var newData = leftSide.concat(rightFlipped);
    return newData;
}
function mergeChannels(soundData) {
    var newData = [];
    for (i in soundData) {
        newData.push((soundData[i] + soundData[parseInt(i) + 64]) / 2);
    }
    return newData;
}
function processSensitivity(soundData) {
    var firstPass = [];
    for (i in soundData) {
        var dataPoint = soundData[i];
        firstPass.push(Math.pow(dataPoint, 1.5)); //leaving this 2 for now because looks nice. set larger than 1 to emphasize peaks set smaller fractions to emphasize lower peaks
    }
    return firstPass;
}
function smoothWaveform(soundData) {
    var firstPass = [];
    for (i in soundData) {
        if (i > 0 && i < 126) {
            var smoothedPoint = (((soundData[i - 1] * 1) + soundData[i] * 2) + (soundData[parseInt(i) + 1] * 1)) / 4
            firstPass.push(smoothedPoint)
        } else {
            firstPass.push(soundData[i])
        }
    }
    return firstPass;

}
var previousSoundData = [];
function tweenData(soundData) {
    var firstPass = [];
    var tweenFloat = tween / 100;
    var tweenFlip = 1 - tweenFloat
    if (previousSoundData.length) {
        for (i in soundData) {
            firstPass.push(previousSoundData[i] * tweenFloat + soundData[i] * tweenFlip);
        }
        previousSoundData = firstPass;
        return firstPass;
    } else {
        previousSoundData = soundData;
        return soundData;
    }
}
var peakValue = 1;
function normlizeWaveform(soundData) {
    var max = 0;
    var normFloat = normalizationSpeed / 100;
    var normFlip = 1 - normFloat
    for (i in soundData) {
        if (soundData[i] > max) max = soundData[i];
    }
    // adjust ratio to how fast or slow you want normalization to react volume changes
    peakValue = peakValue * normFloat + max * normFlip;
    // normalize value
    for (i = 0; i < 128; i++) {
        soundData[i] /= peakValue;
    }
    return soundData;
}
var pinkNoiseOld = [1.1760367470305, 0.85207379418243, 0.68842437227852, 0.63767902570829, 0.5452348949654, 0.50723325864167, 0.4677726234682, 0.44204182748767, 0.41956517802157, 0.41517375040002, 0.41312118577934, 0.40618363960446, 0.39913707474975, 0.38207008614508, 0.38329789106488, 0.37472136606245, 0.36586428412968, 0.37603017335105, 0.39762590761573, 0.39391828858591, 0.37930603769622, 0.39433365764563, 0.38511504613859, 0.39082579241834, 0.3811852720504, 0.40231453727161, 0.40244151133175, 0.39965366884521, 0.39761103827545, 0.51136400422212, 0.66151212038954, 0.66312205226679, 0.7416276690995, 0.74614971301133, 0.84797007577483, 0.8573583910469, 0.96382997811663, 0.99819377577185, 1.0628692615814, 1.1059083969751, 1.1819808497335, 1.257092297208, 1.3226521464753, 1.3735992532905, 1.4953223705889, 1.5310064942373, 1.6193923584808, 1.7094805527135, 1.7706604552218, 1.8491987941428, 1.9238418849406, 2.0141596921333, 2.0786429508827, 2.1575522518646, 2.2196355526005, 2.2660112509705, 2.320762171749, 2.3574848254513, 2.3986127976537, 2.4043566176474, 2.4280476777842, 2.3917477397336, 2.4032522546622, 2.3614180150678];
var pinkNoiseNew = [1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 0.38207008614508, 0.38329789106488, 0.37472136606245, 0.36586428412968, 0.37603017335105, 0.39762590761573, 0.39391828858591, 0.37930603769622, 0.39433365764563, 0.38511504613859, 0.39082579241834, 0.3811852720504, 0.40231453727161, 0.40244151133175, 0.39965366884521, 0.39761103827545, 0.51136400422212, 0.66151212038954, 0.66312205226679, 0.7416276690995, 0.74614971301133, 0.84797007577483, 0.8573583910469, 0.96382997811663, 0.99819377577185, 1.0628692615814, 1.1059083969751, 1.1819808497335, 1.257092297208, 1.3226521464753, 1.3735992532905, 1.4953223705889, 1.5310064942373, 1.6193923584808, 1.7094805527135, 1.7706604552218, 1.8491987941428, 1.9238418849406, 2.0141596921333, 2.0786429508827, 2.0786429508827, 2.0786429508827, 2.0786429508827, 2.0786429508827, 2.0786429508827, 2.0786429508827, 2.4043566176474, 2.4280476777842, 2.3917477397336, 2.4032522546622, 2.4032522546622];
var pinkNoise = pinkNoiseNew;
var usingNew = true;
setInterval(function () {
    if (usingNew) {
        //pinkNoise = pinkNoiseOld;
        usingNew = false;
        $("#debug").html("OLD");
    } else {
        //pinkNoise = pinkNoiseNew;
        usingNew = true;
        $("#debug").html("NEW");
    }
}, 10000)
function correctWithPinkNoiseResults(soundData) {

    for (var i = 0; i < 64; i++) {
        soundData[i] /= pinkNoise[i];
        soundData[i + 64] /= pinkNoise[i];
    }
    return soundData;
}
function smoothPass(soundData, passes) {
    while (passes > 0) {
        soundData = smoothWaveform(soundData);
        passes--;
    }
    $("#debug").html(passes)
}
function insertMoreBars(soundData) {
    var newData = [];
    for (i in soundData) {
        newData.push(soundData[i] * 0.8);
        newData.push(soundData[i]);
        newData.push(soundData[i] * 0.8);
    }
    return newData;
}
function processAudioData(soundData) {
    soundData = normlizeWaveform(soundData);
    soundData = processSensitivity(soundData);
    if (!mirroredMode) {
        soundData = insertMoreBars(soundData);
    }
    soundData = smoothWaveform(soundData);
    soundData = smoothWaveform(soundData);
    soundData = smoothWaveform(soundData);
    //soundData = smoothPass(soundData, smoothPasses); //wtf... not working just because in loop????
    return soundData;
}
function updateGraph(soundData) {
    audioData.datasets[0].data = soundData;
    audioChart.update(1);
}
var audioData = {
    labels: genrateLabelList(' ', 128),
    datasets: [{
        label: ' ',
        data: [0],
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderColor: 'transparent',
        borderWidth: 0
    }]
};
var audioChartctx = document.getElementById('audioCanvas').getContext('2d');
var audioChart = new Chart(audioChartctx, {
    type: 'bar',
    data: audioData,
    options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
            display: false
        },
        scales: {
            yAxes: [{
                gridLines: {
                    display: false
                },
                ticks: {
                    display: false, //this will remove only the label
                    max: 2
                }
            }],
            xAxes: [{
                gridLines: {
                    display: false
                },
                ticks: {
                    display: false //this will remove only the label
                },
                categoryPercentage: 1,
                barPercentage: 0.7
            }]
        }
    }
});
audioChart.update(1);


var r = 255, g = 0, b = 0;
function rainbowLoop() {
    if (visRainbow && !paused) {
        if (r > 0 && b == 0) {
            r--;
            g++;
        }
        if (g > 0 && r == 0) {
            g--;
            b++;
        }
        if (b > 0 && g == 0) {
            r++;
            b--;
        }
        audioData.datasets[0].backgroundColor = "rgba(" + r + "," + g + "," + b + ", 0.6)";
        audioChart.update(0);
        requestAnimationFrame(rainbowLoop);
    }
}