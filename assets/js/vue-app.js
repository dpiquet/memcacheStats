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
 * Get last value
 * @param sourceData
 * @param index
 * @returns {*}
 */
function getLastValue(sourceData, index)
{
    return sourceData[sourceData.length - 1][index];
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
            chartType: 'line',
            chartOptions: {
                scales: {
                    yAxes: [
                        {
                            ticks: {beginAtZero: true}
                        }
                    ]
                }
            },
            chartUpdateConfig: {
                duration: 0,
                easing: 'easeOutBounce'
            },
            showModal: false,
            flushMemcached: flushMemcached,
            chartData: {
                instantHits: getEmptyDataset('Instant Get Hits'),
                instantMisses: getEmptyDataset('Instant Get Misses'),
                instantGetflushed: getEmptyDataset('Instant Get Flushed'),
                instantGetexpired: getEmptyDataset('Instant Get Expired'),
                instantTouchHits: getEmptyDataset('Instant Touch Hits'),
                instantEvictions: getEmptyDataset('Instant Evictions'),
                instantUnfetchedEvicted: getEmptyDataset('Instant Unfetch Evictions'),
                instantTouchMisses: getEmptyDataset('Instant Touch Misses'),
                instantBytesRead: getEmptyDataset('Instant Bytes Read'),
                instantBytesWritten: getEmptyDataset('Instant Bytes Written')
            }
        },
        mounted() {
            var root = this;
            var refresh = function() {
                axios.get('/stats').then(function (response) {

                    var instantHits = instantValues(response.data, 'get_hits');
                    root.chartData.instantHits.datasets[0].data = instantHits;
                    root.chartData.instantHits.labels = instantHits;

                    var instantMisses = instantValues(response.data, 'get_misses');
                    root.chartData.instantMisses.datasets[0].data = instantMisses;
                    root.chartData.instantMisses.labels = instantMisses;

                    var chartdata = instantValues(response.data, 'get_flushed');
                    root.chartData.instantGetflushed.datasets[0].data = chartdata;
                    root.chartData.instantGetflushed.labels = chartdata;

                    chartdata = instantKbValues(response.data, 'bytes_read');
                    root.chartData.instantBytesRead.datasets[0].data = chartdata;
                    root.chartData.instantBytesRead.labels = chartdata;

                    chartdata = instantKbValues(response.data, 'bytes_written');
                    root.chartData.instantBytesWritten.datasets[0].data = chartdata;
                    root.chartData.instantBytesWritten.labels = chartdata;

                    chartdata = instantValues(response.data, 'get_expired');
                    root.chartData.instantGetexpired.datasets[0].data = chartdata;
                    root.chartData.instantGetexpired.labels = chartdata;

                    chartdata = instantValues(response.data, 'touch_hits');
                    root.chartData.instantTouchHits.datasets[0].data = chartdata;
                    root.chartData.instantTouchHits.labels = chartdata;

                    chartdata = instantValues(response.data, 'touch_misses');
                    root.chartData.instantTouchMisses.datasets[0].data = chartdata;
                    root.chartData.instantTouchMisses.labels = chartdata;

                    chartdata = instantValues(response.data, 'evicted_unfetched');
                    root.chartData.instantUnfetchedEvicted.datasets[0].data = chartdata;
                    root.chartData.instantUnfetchedEvicted.labels = chartdata;

                    chartdata = instantValues(response.data, 'evictions');
                    root.chartData.instantEvictions.datasets[0].data = chartdata;
                    root.chartData.instantEvictions.labels = chartdata;
                });
            };
            setInterval(refresh, 3000);
        }
    });
});