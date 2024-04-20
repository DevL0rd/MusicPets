var soundReaction = true;
var visRainbow = false;
var soundDataCache = [];
var autoGrayscale = false;
var autoBlur = false;
var autoHueRotate = false;
var autoSepia = false;
var volumeCutoff = 0.2;
var smoothing = 0.3;
var tween = 0.3;
var normalizationSpeed = 0.99;
var mirroredMode = false;
var visSelect = "bar";
var audioChart = null;
var canvasBlur = 0;
function audioListener(soundData) {
    //128 data points in this
    if (!paused) {
        if (mirroredMode) {
            soundData = mirrorChannels(soundData);
        } else {
            soundData = mergeChannels(soundData);
        }
        
        soundData = normlizeWaveform(soundData);
        soundData = processSensitivity(soundData);
        if (!mirroredMode) {
            soundData = insertMoreBars(soundData);
        }

        soundDataCache = soundData;
    }
}
let temporalSmoothedValues = [];  // Starts empty
function combinedSmoothing(newData) {
    // Initialize temporalSmoothedValues if empty
    if (temporalSmoothedValues.length === 0) {
        temporalSmoothedValues = newData.slice();
    }

    // Temporal smoothing
    for (let i = 0; i < newData.length; i++) {
        temporalSmoothedValues[i] = tween * newData[i] + (1 - tween) * temporalSmoothedValues[i];
    }

    // Spatial smoothing
    let spatialSmoothedData = new Array(64);
    for (let i = 0; i < temporalSmoothedValues.length; i++) {
        let prev = i > 0 ? temporalSmoothedValues[i - 1] : temporalSmoothedValues[i];
        let next = i < temporalSmoothedValues.length - 1 ? temporalSmoothedValues[i + 1] : temporalSmoothedValues[i];
        spatialSmoothedData[i] = smoothing * prev + (1 - 2 * smoothing) * temporalSmoothedValues[i] + smoothing * next;
    }

    // Update the temporal smoothed values with spatially smoothed data for continuity in temporal smoothing
    temporalSmoothedValues = spatialSmoothedData.slice();

    return spatialSmoothedData;
}


function calculateBassReaction(soundData) {
    let bassEnd = 10; // Index up to which bass frequencies are considered
    let bassEnergy = 0;
    for (let i = 0; i <= bassEnd; i++) {
        bassEnergy += soundData[i];
    }

    // Normalize the reaction value to be between 0 and 1
    let reaction = bassEnergy / (bassEnd + 1);
    return Math.min(Math.max(reaction, 0), 1); // Ensures value is between 0 and 1
}
function react(soundData) {
    var reactionStrength = calculateBassReaction(soundData);
    // console.log("---end---")
    if (reactionStrength > 0.05) { //get reactions only in this range
        reactionStrength -= 0.05;
        $("#background-canvas").css({
            "transform": "scale(" + (1 + reactionStrength / 8) + ")"
        })
        if (autoGrayscale) {
            $("#grayscale").css({
                "filter": "grayscale(" + (reactionStrength / 2) + ")"
            })
        }
        if (autoBlur) {
            $("#background-canvas").css({
                "filter": "blur(" + (reactionStrength) * 5 + "px)"
            });
        }
        if (autoHueRotate) {
            $("#huerotation").css({
                "filter": "hue-rotate(" + reactionStrength / 2 + "turn)"
            })
        }
        if (autoSepia) {
            $("#sepia").css({
                "filter": "sepia(" + (reactionStrength / 2) + ")"
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
    var half_length = Math.floor(soundData.length / 2);
    var leftSide = soundData.splice(0, half_length);
    var rightSide = soundData;
    var rightFlipped = rightSide.reverse();
    var newData = leftSide.concat(rightFlipped);
    return newData;
}
function mergeChannels(soundData) {
    var newData = [];
    var half_length = Math.floor(soundData.length / 2);
    for (var i = 0; i < half_length; i++) {
        newData.push((soundData[i] + soundData[i + half_length]) / 2);
    }
    return newData;
}
function processSensitivity(soundData) {
    var firstPass = [];
    for (i in soundData) {
        var dataPoint = soundData[i];
        // have a cutoff point to ignore low volume
        if (dataPoint < volumeCutoff) {
            dataPoint = 0;
        }
        firstPass.push(Math.pow(dataPoint, 1.6)); //leaving this 2 for now because looks nice. set larger than 1 to emphasize peaks set smaller fractions to emphasize lower peaks
    }
    return firstPass;
}

var peakValue = 1;
function normlizeWaveform(soundData) {
    var max = 0;
    var normFlip = 1 - normalizationSpeed
    for (i in soundData) {
        if (soundData[i] > max) max = soundData[i];
    }
    // adjust ratio to how fast or slow you want normalization to react volume changes
    peakValue = peakValue * normalizationSpeed + max * normFlip;
    // normalize value
    for (i = 0; i < soundData.length; i++) {
        soundData[i] /= peakValue;
    }
    return soundData;
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

var setInitialBarCount = false;
function updateGraph(soundData) {
    if (!setInitialBarCount && soundData.length > 1) {
        audioData.labels = genrateLabelList(' ', soundData.length);
        setInitialBarCount = true;
    }
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
function initAudioChart() {
    audioChart = new Chart(audioChartctx, {
        type: visSelect,
        data: audioData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                display: false
            },
            // don't show the points on the line
            elements: {
                point: {
                    radius: 0
                }
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
                    }
                }]
            }
        }
    });
    audioChart.update(1);
}
initAudioChart();

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


function visualize() {
    if (soundDataCache.length) {
        var soundData = combinedSmoothing(soundDataCache);
        updateGraph(soundData);
        if (soundReaction) {
            react(soundData);
        }
    }
}