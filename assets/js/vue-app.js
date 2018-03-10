/**
 * Front Vue.js app
 *
 */

// Expose app
var app;

/**
 * Create empty dataset
 * @param title
 * @returns {{labels: string[], datasets: *[]}}
 */
function getEmptyDataset(title)
{
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

    return {
        labels: ["N/C"],
        datasets: [{
            label: title,
            data: [NaN],
            backgroundColor: backgroundColor,
            borderColor: borderColor,
            borderWidth: 1,
            pointRadius: 0
        }]
    };
}

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

/**
 * Get instant values
 * @param sourceData
 * @param index
 * @returns {Array}
 */
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

/**
 * Get instant values as Kilobytes
 * @param sourceData
 * @param index
 * @returns {Array}
 */
function instantKbValues(sourceData, index)
{
    var ret = [];

    var previousVal = 0;
    var processedVals = 0;

    for (data in sourceData) {
        var thisVal = Math.round(sourceData[data][index] / 1024).toFixed(2);

        if (processedVals > 0) {
            ret.push(thisVal - previousVal);
        }

        processedVals += 1;
        previousVal = thisVal;
    }

    return ret;
}

/**
 * Send memcached flush command
 */
function flushMemcached()
{
    axios.get('/flush').then(function() {
        app.showModal = true;
    });
}

/**
 * Start app
 */
window.addEventListener('load', function() {
    Vue.use(VueChart);

    // register modal component
    Vue.component('modal', {
        template: '#modal-template'
    });

    app = new Vue({
        el: '#app',
        data: {
            showModal: false,
            flushMemcached: flushMemcached,
            hitsVsMiss: getEmptyDataset('Global % Get Hits'),
            inVsOut: getEmptyDataset('Global % Bytes Read'),
            getVsSet: getEmptyDataset('Global % get/set'),
            instantHits: getEmptyDataset('Instant Get Hits'),
            instantMisses: getEmptyDataset('Instant Get Misses'),
            instantGetflushed: getEmptyDataset('Instant Get Flushed'),
            instantGetexpired: getEmptyDataset('Instant Get Expired'),
            instantBytesRead: getEmptyDataset('Instant Bytes Read'),
            instantBytesWritten: getEmptyDataset('Instant Bytes Written')
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

                    var chartdata = instantValues(response.data, 'get_flushed');
                    root.instantGetflushed.datasets[0].data = chartdata;
                    root.instantGetflushed.labels = chartdata;

                    chartdata = instantKbValues(response.data, 'bytes_read');
                    root.instantBytesRead.datasets[0].data = chartdata;
                    root.instantBytesRead.labels = chartdata;

                    chartdata = instantKbValues(response.data, 'bytes_written');
                    root.instantBytesWritten.datasets[0].data = chartdata;
                    root.instantBytesWritten.labels = chartdata;

                    chartdata = instantKbValues(response.data, 'get_expired');
                    root.instantGetexpired.datasets[0].data = chartdata;
                    root.instantGetexpired.labels = chartdata;
                });
            };
            setInterval(refresh, 3000);
        }
    });
});