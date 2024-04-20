
function getWholePercent(percentFor, percentOf) {
    return Math.floor(percentFor / percentOf * 100);
}
function genrateLabelList(label, length) {
    var labels = [];
    while (length > 0) {
        labels.push(label);
        length--;
    }
    return labels;
}
var pingData = {
    labels: genrateLabelList('Ping', 20),
    datasets: [{
        label: 'Ping',
        data: [0],
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.7)',
        borderWidth: 0
    }]
};
var pingChartctx = document.getElementById('pingChart').getContext('2d');
var pingChart = new Chart(pingChartctx, {
    type: 'line',
    data: pingData,
    options: {
        responsive: false,
        maintainAspectRatio: false,
        legend: {
            display: false
        },
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
                    display: false //this will remove only the label
                },
                maxValue: 2
            }],
            xAxes: [{
                gridLines: {
                    display: false
                },
                ticks: {
                    display: false //this will remove only the label
                }
            }]
        },
        width: '100%'
    }
});
function ping(host, pong) {

    var started = Date.now();

    var http = new XMLHttpRequest();

    http.open("POST", host, /*async*/true);
    http.onreadystatechange = function () {
        if (http.readyState == 1) {
            started = Date.now();
        }
        if (http.readyState == 2) {
            var ended = Date.now();

            var milliseconds = ended - started;

            if (pong != null) {
                pong(milliseconds);
            }
        }
    };
    try {
        http.send(null);
    } catch (exception) {
        // this is expected
    }

}
function pingCallback(pingTime) {
    pingData.datasets[0].data.push(pingTime)
    if (pingData.datasets[0].data.length > 20) {
        pingData.datasets[0].data.shift();
    }
    pingChart.update(1);
    $("#pingTitle").html("Ping " + pingTime + "ms");
    if (!paused) {
        setTimeout(testPing, 1000);
    }
}
function testPing() {
    ping("https://www.google.com/thisisjustsomedumbassfakeendpointtotestlatency", pingCallback)
}