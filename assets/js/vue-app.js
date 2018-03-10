/**
 * Front Vue.js app
 *
 */

function globalOutOf(sourceData, index, comparedTo)
{
    var ret = [];

    for (data in sourceData) {
        var thisVal = sourceData[data][index];

        var total = thisVal;

        for (c in comparedTo) {
            total += sourceData[data][comparedTo[c]];
        }

        ret.push(Math.round(thisVal / total * 100).toFixed(2));
    }

    return ret;
}

function instantValues(sourceData, index)
{
    var ret = [];

    var previousVal = 0;
    var processedVals = 0;

    for (data in sourceData) {
        var thisVal = sourceData[data][index];

        if (processedVals > 0) {
            ret.push(thisVal - previousVal);
        }

        processedVals += 1;
        previousVal = thisVal;
    }

    return ret;
}

window.addEventListener('load', function() {

    Vue.use(VueChart);

    var msg = 'test';

    var backgroundColor = [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
    ];

    var borderColor = [
        'rgba(255,99,132,1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
    ];

    var hitsVsMissDataset = {
        labels: ["N/C"],
        datasets: [{
            label: 'Global % Get Hits',
            data: [NaN],
            backgroundColor: backgroundColor,
            borderColor: borderColor,
            borderWidth: 1
        }]
    };

    var inVsOutDataset = {
        labels: ["N/C"],
        datasets: [{
            label: 'Global % Bytes Read',
            data: [NaN],
            backgroundColor: backgroundColor,
            borderColor: borderColor,
            borderWidth: 1
        }]
    };

    var getVsSetDataset = {
        labels: ["N/C"],
        datasets: [{
            label: 'Global % get/set',
            data: [NaN],
            backgroundColor: backgroundColor,
            borderColor: borderColor,
            borderWidth: 1
        }]
    };

    var instantHitsDataset = {
        labels: ["N/C"],
        datasets: [{
            label: 'Instant Hits',
            data: [NaN],
            backgroundColor: backgroundColor,
            borderColor: borderColor,
            borderWidth: 1
        }]
    };

    var instantMissesDataset = {
        labels: ["N/C"],
        datasets: [{
            label: 'Instant Misses',
            data: [NaN],
            backgroundColor: backgroundColor,
            borderColor: borderColor,
            borderWidth: 1
        }]
    };

    var app = new Vue({
        el: '#app',
        data: {
            message: msg,
            hitsVsMiss: hitsVsMissDataset,
            inVsOut: inVsOutDataset,
            getVsSet: getVsSetDataset,
            instantHits: instantHitsDataset,
            instantMisses: instantMissesDataset
        },
        mounted() {
            var root = this;
            var refresh = function() {
                axios.get('/stats').then(function (response) {
                    var hitsVsMiss = globalOutOf(response.data, 'get_hits', ['get_misses', 'get_expired', 'get_flushed']);
                    root.hitsVsMiss.datasets[0].data = hitsVsMiss;
                    root.hitsVsMiss.labels = hitsVsMiss;

                    var inVsOut = globalOutOf(response.data, 'bytes_read', ['bytes_written']);
                    root.inVsOut.datasets[0].data = inVsOut;
                    root.inVsOut.labels = inVsOut;

                    var getVsSet = globalOutOf(response.data, 'cmd_get', ['cmd_set']);
                    root.getVsSet.datasets[0].data = getVsSet;
                    root.getVsSet.labels = getVsSet;

                    var instantHits = instantValues(response.data, 'get_hits');
                    root.instantHits.datasets[0].data = instantHits;
                    root.instantHits.labels = instantHits;

                    var instantMisses = instantValues(response.data, 'get_misses');
                    root.instantMisses.datasets[0].data = instantMisses;
                    root.instantMisses.labels = instantMisses;
                });
            };
            setInterval(refresh, 3000);
        }
    });
});