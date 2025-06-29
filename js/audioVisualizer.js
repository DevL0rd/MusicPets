var soundReaction = true;
var useBubbles = true;
var visRainbow = false;
var soundDataCache = [];
var autoBrightness = false;
var autoContrast = false;
var autoSaturation = false;
var autoGrayscale = false;
var autoBlur = false;
var autoHueRotate = false;
var autoSepia = false;
var volumeCutoff = 0.2;
var smoothing = 0.2;
var tween = 0.25;
var normalizationSpeed = 0.99;
var mirroredMode = false;
var visSelect = "bar";
var audioChart = null;
var canvasBlur = 0;
var flipVis = false;
var soundVisOffset = 0;
var animCanvas = document.getElementById('animation-canvas');
var animCtx = animCanvas.getContext('2d');

$(document).ready(function () {
    animCanvas.width = window.innerWidth;
    animCanvas.height = window.innerHeight;
});
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
            soundData = insertMoreBars(soundData, 1);
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
    //reverse exponential reaction
    // return Math.pow(reaction, 0.5);
    //logarithmic reaction
    // return Math.log(reaction + 1)
    //both
    return Math.sqrt(Math.log(reaction + 1));
}
// refactor calculateBassReaction to 

function react(soundData) {
    var reactionStrength = calculateBassReaction(soundData);
    // console.log("---end---")
    if (reactionStrength > 0.1) { //get reactions only in this range
        reactionStrength -= 0.1;
        reactionStrength /= 0.9; //normalize to 0-1

        if (useBubbles) {
            generateBubbles(Math.floor(reactionStrength * 15));
        }
        $("#background-canvas").css({
            "transform": "scale(" + (1 + reactionStrength * 0.2) + ")"
        })
        if (autoBrightness) {
            $("#brightness").css({
                "filter": "brightness(" + (1 + reactionStrength) + ")"
            })
        }
        if (autoContrast) {
            $("#contrast").css({
                "filter": "contrast(" + (1 + reactionStrength) + ")"
            })
        }
        if (autoSaturation) {
            $("#saturation").css({
                "filter": "saturate(" + ((1 + reactionStrength)) + ")"
            })
        }
        if (autoGrayscale) {
            $("#grayscale").css({
                "filter": "grayscale(" + (reactionStrength) + ")"
            })
        }
        if (autoBlur) {
            $("#background-canvas").css({
                "filter": "blur(" + (reactionStrength) * 8 + "px)"
            });
        }
        if (autoHueRotate) {
            $("#huerotation").css({
                "filter": "hue-rotate(" + reactionStrength + "turn)"
            })
        }
        if (autoSepia) {
            $("#sepia").css({
                "filter": "sepia(" + (reactionStrength * 2) + ")"
            })
        }

    } else {
        $("#background-canvas").css({
            "transform": "none"
        })
        if (autoBrightness) {
            $("#brightness").css({
                "filter": "none"
            })
        }
        if (autoContrast) {
            $("#contrast").css({
                "filter": "none"
            })
        }
        if (autoSaturation) {
            $("#saturation").css({
                "filter": "none"
            })
        }
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
        firstPass.push(Math.pow(dataPoint, 1.7)); //leaving this 2 for now because looks nice. set larger than 1 to empharadius peaks set smaller fractions to empharadius lower peaks
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
        if (soundData[i] > 1) soundData[i] = 1;
    }
    return soundData;
}

function insertMoreBars(data, barsToAdd) {
    var newData = [];
    for (var i = 0; i < data.length - 1; i++) {
        var current = data[i];
        var next = data[i + 1];

        newData.push(current);

        for (var j = 0; j < barsToAdd; j++) {
            var fraction = (j + 1) / (barsToAdd + 1);
            var interpolatedValue = current + fraction * (next - current);
            newData.push(interpolatedValue);
        }
    }

    // Don't forget to push the last data point
    newData.push(data[data.length - 1]);

    return newData;
}

function updateGraph(soundData) {
    if (flipVis) {
        soundData = soundData.reverse();
    }
    audioData.labels = genrateLabelList(' ', soundData.length);
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
    // reset data
    if (audioChart) {
        audioChart.destroy();
    }
    temporalSmoothedValues = [];
    soundDataCache = [];
    audioData.datasets[0].data = [0];
    audioChart = new Chart(audioChartctx, {
        type: visSelect, //bar, line, radar, polarArea, doughnut, pie, bubble, scatter
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
                    }
                }]
            }
        }
    });
    if (visSelect == "line") {
        audioChart.options.elements.line.tension = 0.3;
        // remove points on the line
        audioChart.options.elements.point.radius = 0;

    } else if (visSelect == "radar") {
        audioChart.options.scale = {
            ticks: {
                display: false //this will remove only the labels for radar
            },
            angleLines: {
                display: false //this will remove the radial lines for radar
            },
            gridLines: {
                display: false //this will remove the grid lines for radar
            }
        }
        // use suggestedMin to -1 to make the radar chart start from the center
        audioChart.options.scale.ticks.suggestedMin = -1;
        audioChart.options.scale.ticks.suggestedMax = 1;
        audioChart.options.elements.line.tension = 0.3;
        // remove points on the line
        audioChart.options.elements.point.radius = 0;

        // give circle gradient color
        // give the fill color a gradient


    }
    audioChart.update(1);
}
initAudioChart();

var r = 255, g = 0, b = 0;
function updateRGB() {
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
}

var bubbles = [];
class Bubble {
    constructor() {
        this.x = Math.random() * window.innerWidth;
        this.y = window.innerHeight - soundVisOffset;
        this.radius = Math.random() * 10 + 2;
        this.velocity = {
            x: -((Math.random() * 5) + 4),
            y: (Math.random() * 4) + 1
        }
    }
    update() {
        this.y -= this.velocity.y;
        this.x += this.velocity.x;
        if ((this.y + this.radius) < 0) {
            this.y = window.innerHeight;
        }
        if ((this.x + this.radius) < 0) {
            this.x = window.innerWidth + this.radius;
        } else if ((this.x - this.radius) > window.innerWidth) {
            this.x = 0;
        }
        // shrink the bubble
        this.radius -= 0.03;
        // remove bubble if it's too small
        if (this.radius < 0) {
            this.radius = 0;
        }
    }
    render() {
        animCtx.fillStyle = "rgba(" + r + "," + g + "," + b + ", 0.6)";
        animCtx.beginPath();
        animCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        animCtx.fill();
    }
}

function updateBubbles() {
    for (var i = 0; i < bubbles.length; i++) {
        bubbles[i].update();
    }
}
function renderBubbles() {
    for (var i = 0; i < bubbles.length; i++) {
        bubbles[i].render();
    }
}
function cleanupBubbles() {
    for (var i = 0; i < bubbles.length; i++) {
        if (bubbles[i].radius <= 0 || bubbles[i].y <= 0) {
            bubbles.splice(i, 1);
        }
    }
}
function generateBubbles(count) {

    for (var i = 0; i < count; i++) {
        bubbles.push(new Bubble());
    }

}
function doBubbles() {
    updateBubbles();
    renderBubbles();
    cleanupBubbles();
}
function visualize() {
    if (visRainbow) {
        updateRGB();
    }
    if (soundDataCache.length) {
        var soundData = combinedSmoothing(soundDataCache);
        updateGraph(soundData);
        if (soundReaction) {
            react(soundData);
        }
    }
    // animations:
    animCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (useBubbles) {
        doBubbles();
    }
}