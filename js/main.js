var background;
var bgCanvas = document.getElementById('background-canvas');
var bgCtx = bgCanvas.getContext('2d');
var video = document.getElementById('video');
var image = document.getElementById('image');
var isVideo = false;
var schemecolor = "rgba(255, 0, 0, 0.6)";

$(document).ready(function () {
    window.wallpaperRegisterAudioListener(audioListener);
    bgCanvas.width = window.innerWidth; //set render width and height
    bgCanvas.height = window.innerHeight; //different from canvas width and height
    render();
});
// Read changes made by users
window.wallpaperPropertyListener = {
    setPaused: function (isPaused) {
        paused = isPaused;
        if (!paused) {
            render();
        }
    },
    applyGeneralProperties: function (properties) {
        if (properties.fps) {
            settings.fps = properties.fps;
        }
    },
    applyUserProperties: function (properties) {
        console.log(properties);
        if (properties.perf_enableFPS) {
            if (properties.perf_enableFPS.value) {
                //visualizer.settings.fpsEnabled = true;
            } else {
                //visualizer.settings.fpsEnabled = false;
            }
        }
        if (properties.perf_disableBackgroundUpdate) {
            if (properties.perf_disableBackgroundUpdate.value) {
                background.settings.updateBackgroundDisabled = true;
            } else {
                background.settings.updateBackgroundDisabled = false;
            }
        }
        if (properties.blur) {
            if (properties.blur.value) {
                $("#background-canvas").css({
                    "filter": "blur(" + properties.blur.value / 10 + "px)"
                });
            } else {
                $("#background-canvas").css({
                    "filter": "none"
                });
            }
        }
        if (properties.vignette) {
            if (properties.vignette.value) {
                $("#vignette").css({
                    "box-shadow": "0 0 200px rgba(0, 0, 0, " + (properties.vignette.value / 100) + ") inset"
                })
            }
        }
        if (properties.grayscale) {
            if (properties.grayscale.value) {
                $("#grayscale").css({
                    "filter": "grayscale(" + (properties.grayscale.value / 100) + ")"
                })
            }
        }
        if (properties.sepia) {
            if (properties.sepia.value) {
                $("#sepia").css({
                    "filter": "sepia(" + (properties.sepia.value / 100) + ")"
                })
            }
        }
        if (properties.saturation) {
            if (properties.saturation.value) {
                $("#saturation").css({
                    "filter": "saturate(" + (properties.saturation.value / 100) + ")"
                })
            }
        }
        if (properties.huerotation) {
            if (properties.huerotation.value) {
                $("#huerotation").css({
                    "filter": "hue-rotate(" + properties.huerotation.value + "deg)"
                })
            }
        }
        if (properties.invert) {
            if (properties.invert.value) {
                $("#invert").css({
                    "filter": "invert(" + (properties.invert.value / 100) + ")"
                })
            }
        }
        if (properties.contrast) {
            if (properties.contrast.value) {
                $("#contrast").css({
                    "filter": "contrast(" + (properties.contrast.value / 100) + ")"
                })
            }
        }
        if (properties.brightness) {
            if (properties.brightness.value) {
                $("#brightness").css({
                    "filter": "brightness(" + (properties.brightness.value / 100) + ")"
                })
            }
        }
        if (properties.schemecolor) {
            if (properties.schemecolor.value) {
                //Get a rgb string from color value passed by wallpaper-engine
                schemecolor = properties.schemecolor.value.split(' ').map(function (c) {
                    return Math.ceil(c * 255)
                });
                r = schemecolor[0];
                g = schemecolor[1];
                b = schemecolor[2];
                audioData.datasets[0].backgroundColor = "rgba(" + schemecolor + ", 0.6)";
                audioChart.update(0);
            }
        }
        if (properties.visRainbow) {
            visRainbow = properties.visRainbow.value;
            if (!visRainbow) {
                r = schemecolor[0];
                g = schemecolor[1];
                b = schemecolor[2];
                audioData.datasets[0].backgroundColor = "rgba(" + schemecolor + ", 0.6)";
                audioChart.update(0);
            } else {
                r = 255, g = 0, b = 0;
            }
        }
        
        if (properties.soundReaction) {
            soundReaction = properties.soundReaction.value;
            if (!soundReaction) {
                $("#grayscale").css({
                    "filter": "none"
                })
                $("#background-canvas").css({
                    "filter": "none"
                })
                $("#huerotation").css({
                    "filter": "none"
                })
                $("#sepia").css({
                    "filter": "none"
                })
                $("#background-canvas").css({
                    "transform": "none"
                })
            }
        }
        if (properties.visSelect) {
            if (properties.visSelect.value) {
                visSelect = properties.visSelect.value;
                initAudioChart();
            }
        }
        // flipVis
        if (properties.flipVis) {
            flipVis = properties.flipVis.value;
        }

        if (properties.soundVisOffset) {
            soundVisOffset = properties.soundVisOffset.value;
            // set css #audioVisualizer offset
            //default: bottom: 30px;
            $("#audioVisualizer").css({
                "bottom": soundVisOffset + "px"
            })
        }
        // autoBrightness
        if (properties.autoBrightness) {
            autoBrightness = properties.autoBrightness.value;
            if (!autoBrightness) {
                $("#brightness").css({
                    "filter": "none"
                })
            };
        }

        // autoContrast
        if (properties.autoContrast) {
            autoContrast = properties.autoContrast.value;
            if (!autoContrast) {
                $("#contrast").css({
                    "filter": "none"
                })
            };
        }

        // autoSaturation

        if (properties.autoSaturation) {
            autoSaturation = properties.autoSaturation.value;
            if (!autoSaturation) {
                $("#saturation").css({
                    "filter": "none"
                })
            };
        }
        
           
        if (properties.autoGrayscale) {
            autoGrayscale = properties.autoGrayscale.value;
            if (!autoGrayscale) {
                $("#grayscale").css({
                    "filter": "none"
                })
            };
        }
        
        if (properties.autoBlur) {
            autoBlur = properties.autoBlur.value;
            if (!autoBlur) {
                $("#background-canvas").css({
                    "filter": "none"
                })
            };
        }
        if (properties.autoHueRotate) {
            autoHueRotate = properties.autoHueRotate.value;
            if (!autoHueRotate) {
                $("#huerotation").css({
                    "filter": "none"
                })
            };
        }
        if (properties.autoSepia) {
            autoSepia = properties.autoSepia.value;
            if (!autoSepia) {
                $("#sepia").css({
                    "filter": "none"
                })
            };
        }

        if (properties.bgSource) {
            if (properties.bgSource.value) {
                var bgSource = "file:///" + properties.bgSource.value;
                if (bgSource.toLowerCase().includes(".webm") || bgSource.toLowerCase().includes(".mp4")) {
                    isVideo = true;
                    $("#video").attr("src", bgSource)
                } else {
                    isVideo = false;
                    $("#image").attr("src", bgSource)
                }
            }
        }
        if (properties.catSelect) {
            if (properties.catSelect.value) {
                NekoType = properties.catSelect.value
                localStorage.NekoType = NekoType;
                addNeko(true);
            }
        }
        if (properties.mirroredMode) {
            if (properties.mirroredMode.value) {
                mirroredMode = properties.mirroredMode.value
                initAudioChart();
            }
        }
        //bubbles
        if (properties.bubbles) {
            useBubbles = properties.bubbles.value;
            if (!useBubbles) {
                bubbles = [];
            }
        }
        if (properties.weather) {
            if (properties.weather.value) {
                if (properties.weather.value == "auto") {
                    $('#weather').removeClass('rain').removeClass('snow');
                } else if (properties.weather.value == "rain") {
                    $('#weather').addClass('rain').removeClass('snow');
                } else if (properties.weather.value == "snow") {
                    $('#weather').addClass('snow').removeClass('rain');
                }
            }
        }
    }
}

var last = performance.now() / 1000;
var fpsThreshold = 0;
function render() {
    if (!paused) {
        // Keep animating
        window.requestAnimationFrame(render);
        // Figure out how much time passed since the last animation
        var now = performance.now() / 1000;
        var dt = Math.min(now - last, 1);
        last = now;
        // If there is an FPS limit, abort updating the animation if we reached the desired FPS
        if (settings.fps > 0) {
            fpsThreshold += dt;
            if (fpsThreshold < 1.0 / settings.fps) {
                return;
            }
            fpsThreshold -= 1.0 / settings.fps;
        }
        var contentSrc = isVideo ? video : image;
        var contentWidth = contentSrc.videoWidth || contentSrc.width;
        var contentHeight = contentSrc.videoHeight || contentSrc.height;
        // fit screen and maintain aspect ratio
        var scale = Math.max(bgCanvas.width / contentWidth, bgCanvas.height / contentHeight);
        var x = (bgCanvas.width / 2 - contentWidth / 2 * scale);
        var y = (bgCanvas.height / 2 - contentHeight / 2 * scale);
        bgCtx.drawImage(contentSrc, x, y, contentWidth * scale, contentHeight * scale);

        // Render sound stuff
        visualize();
    }
}