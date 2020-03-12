var background;
var vidSource = "./vid/bg.webm";
$(document).ready(function () {
    // Set to own resolution first -- will get overriden by settings
    $("#main-canvas, #background-canvas").attr({
        width: window.width,
        height: window.height
    });
    window.wallpaperRegisterAudioListener(audioListener);
    testPing(); //start the ping loop
    updateClock(); //start clock loop
    renderVis();
    addNeko(false);
});
// Read changes made by users
window.wallpaperPropertyListener = {
    setPaused: function (isPaused) {
        paused = isPaused;
        if (paused) {
            $("#content").hide(); //unload dom when not in view for performance when monitor changes resolution
            $("#background-canvas").trigger('pause');
        } else {
            $("#content").show(); //reload dom
            testPing(); //start the ping loop
            updateClock(); //start clock loop
            renderVis();
            if (visRainbow) {
                rainbowLoop();
            }
            try {
                $('#background-canvas').trigger('play');
            } catch (error) {

            }
        }
    },
    applyGeneralProperties: function (properties) {
        // if (properties.fps) {
        //     visualizer.setFPS(properties.fps);
        // }
    },
    applyUserProperties: function (properties) {
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
        if (properties.accentcolor) {
            if (properties.accentcolor.value) {
                //Get a rgb string from color value passed by wallpaper-engine
                var rgbStr = properties.accentcolor.value.split(' ').map(function (c) {
                    return Math.ceil(c * 255)
                });
                //Clock accents
                $(".clock").css({
                    "border-color": "rgba(" + rgbStr + ", 0.7)"
                })
                $(".clock").css({
                    "box-shadow": "inset 3px 3px 6px rgba(0, 0, 0, 0.7), 3px 3px 30px rgba(" + rgbStr + ", 0.7)"
                })
                //Chart accents
                $(".chartpanel").css({
                    "border-color": "rgba(" + rgbStr + ", 0.7)"
                })
                $(".chartpanel").css({
                    "box-shadow": "inset 3px 3px 6px rgba(0, 0, 0, 0.7), 3px 3px 30px rgba(" + rgbStr + ", 0.7)"
                })
            }
        }
        if (properties.chartColor) {
            if (properties.chartColor.value) {
                //Get a rgb string from color value passed by wallpaper-engine
                var rgbStr = properties.chartColor.value.split(' ').map(function (c) {
                    return Math.ceil(c * 255)
                });
                //Clock hands
                $(".clock .hour").css({
                    "background-color": "rgba(" + rgbStr + ", 0.7)"
                })
                $(".clock .minute").css({
                    "background-color": "rgba(" + rgbStr + ", 0.7)"
                })
                $(".clock .second").css({
                    "background-color": "rgba(" + rgbStr + ", 0.7)"
                })
                $(".center").css({
                    "background-color": "rgba(" + rgbStr + ", 0.7)"
                })
                $(".clockText").css({
                    "color": "rgba(" + rgbStr + ", 0.4)"
                })
                //Charts
                $(".chartTitle").css({
                    "color": "rgba(" + rgbStr + ", 0.4)"
                })
                pingData.datasets[0].backgroundColor = "rgba(" + rgbStr + ", 0.7)";
                pingData.datasets[0].borderColor = "rgba(" + rgbStr + ", 0.7)";
                pingChart.update(0);
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
        if (properties.visColor) {
            if (properties.visColor.value) {
                //Get a rgb string from color value passed by wallpaper-engine
                var rgbStr = properties.visColor.value.split(' ').map(function (c) {
                    return Math.ceil(c * 255)
                });
                audioData.datasets[0].backgroundColor = "rgba(" + rgbStr + ", 0.6)";
                audioChart.update(0);
            }
        }
        if (properties.visRainbow) {
            visRainbow = properties.visRainbow.value;
            if (visRainbow) {
                rainbowLoop();
            } else {
                //Get a rgb string from color value passed by wallpaper-engine
                var rgbStr = properties.visColor.value.split(' ').map(function (c) {
                    return Math.ceil(c * 255)
                });
                audioData.datasets[0].backgroundColor = "rgba(" + rgbStr + ", 0.6)";
                audioChart.update(0);
            }
        }
        if (properties.soundSamplePoint) {
            if (properties.soundSamplePoint.value) {
                soundSamplePoint = properties.soundSamplePoint.value;
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

        if (properties.vidSource) {
            if (properties.vidSource.value) {
                vidSource = properties.vidSource.value;
                $("#background-canvas").attr('src', vidSource);
            }
        }
        if (properties.catSelect) {
            if (properties.catSelect.value) {
                NekoType = properties.catSelect.value
                localStorage.NekoType = NekoType;
                addNeko(false);
            }
        }
        if (properties.reactionLowPass) {
            if (properties.reactionLowPass.value) {
                reactionLowPass = properties.reactionLowPass.value
            }
        }
        if (properties.tween) {
            if (properties.tween.value) {
                tween = properties.tween.value
            }
        }
        if (properties.normalizationSpeed) {
            if (properties.normalizationSpeed.value) {
                normalizationSpeed = properties.normalizationSpeed.value
            }
        }
        if (properties.mirroredMode) {
            if (properties.mirroredMode.value) {
                mirroredMode = properties.mirroredMode.value
            }
        }

        if (properties.weather) {
            if (properties.weather.value) {
                if (properties.weather.value == "auto") {

                } else if (properties.weather.value == "rain") {
                    makeItRain();
                }
            }
        }
    }
}