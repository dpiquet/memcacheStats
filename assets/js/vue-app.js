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

function getRawValues(sourceData, index)
{
    var ret = [];

    for (data in sourceData) {
        ret.push(sourceData[data][index]);
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

    // Tooltips borrowed from: https://github.com/bananastalktome/memcached_stats
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
                },
                elements: {
                    line: {
                        tension: 0 // No Beziers curve
                    }
                }
            },
            chartUpdateConfig: {
                duration: 0
            },
            showModal: false,
            flushMemcached: flushMemcached,
            chartDataGroups: {
                cmds: {
                    groupName: 'Commands',
                    data: [
                        {
                            dataset: getEmptyDataset('CMD Get'),
                            updateMethod: instantValues,
                            updateLabelsMethod: instantValues,
                            totalMethod: getLastValue,
                            memcache_item: 'cmd_get',
                            total: 'N/C',
                            tooltip: 'Number of retrieval requests'
                        },
                        {
                            dataset: getEmptyDataset('CMD Set'),
                            updateMethod: instantValues,
                            updateLabelsMethod: instantValues,
                            totalMethod: getLastValue,
                            memcache_item: 'cmd_set',
                            total: 'N/C',
                            tooltip: 'Number or storage requests'
                        },
                        {
                            dataset: getEmptyDataset('CMD Flush'),
                            updateMethod: instantValues,
                            updateLabelsMethod: instantValues,
                            totalMethod: getLastValue,
                            memcache_item: 'cmd_flush',
                            total: 'N/C',
                            tooltip: 'Number of flush requests'
                        },
                        {
                            dataset: getEmptyDataset('CMD Touch'),
                            updateMethod: instantValues,
                            updateLabelsMethod: instantValues,
                            totalMethod: getLastValue,
                            memcache_item: 'cmd_touch',
                            total: 'N/C',
                            tooltip: 'Number of touch requests'
                        }
                    ]
                },
                commands: {
                    groupName: 'Commands - details',
                    data: [
                        {
                            dataset: getEmptyDataset('Get Hits'),
                            updateMethod: instantValues,
                            updateLabelsMethod: instantValues,
                            totalMethod: getLastValue,
                            memcache_item: 'get_hits',
                            total: 'N/C',
                            tooltip: 'Number of keys that have been requested and found present'
                        },
                        {
                            dataset: getEmptyDataset('Get Misses'),
                            updateMethod: instantValues,
                            updateLabelsMethod: instantValues,
                            totalMethod: getLastValue,
                            memcache_item: 'get_misses',
                            total: 'N/C',
                            tooltip: 'Number of items that have been requested and not found'
                        },
                        {
                            dataset: getEmptyDataset('Get Flushed'),
                            updateMethod: instantValues,
                            updateLabelsMethod: instantValues,
                            totalMethod: getLastValue,
                            memcache_item: 'get_flushed',
                            total: 'N/C',
                            tooltip: ''
                        },
                        {
                            dataset: getEmptyDataset('Get Expired'),
                            updateMethod: instantValues,
                            updateLabelsMethod: instantValues,
                            totalMethod: getLastValue,
                            memcache_item: 'get_expired',
                            total: 'N/C',
                            tooltip: 'Number of items that have been requested but were expired'
                        },
                        {
                            dataset: getEmptyDataset('Touch Hits'),
                            updateMethod: instantValues,
                            updateLabelsMethod: instantValues,
                            totalMethod: getLastValue,
                            memcache_item: 'touch_hits',
                            total: 'N/C',
                            tooltip: ''
                        },
                        {
                            dataset: getEmptyDataset('Touch Misses'),
                            updateMethod: instantValues,
                            updateLabelsMethod: instantValues,
                            totalMethod: getLastValue,
                            memcache_item: 'touch_misses',
                            total: 'N/C',
                            tooltip: ''
                        },
                        {
                            dataset: getEmptyDataset('Delete Hits'),
                            updateMethod: instantValues,
                            updateLabelsMethod: instantValues,
                            totalMethod: getLastValue,
                            memcache_item: 'delete_hits',
                            total: 'N/C',
                            tooltip: 'Number of deletion requests resulting in an item being removed'
                        },
                        {
                            dataset: getEmptyDataset('Delete Misses'),
                            updateMethod: instantValues,
                            updateLabelsMethod: instantValues,
                            totalMethod: getLastValue,
                            memcache_item: 'delete_misses',
                            total: 'N/C',
                            tooltip: 'Number of deletions requests for missing keys'
                        },
                    ]
                },
                system: {
                    groupName: 'System',
                    data: [
                        {
                            dataset: getEmptyDataset('Current Items'),
                            updateMethod: getRawValues,
                            updateLabelsMethod: getRawValues,
                            totalMethod: getLastValue,
                            memcache_item: 'curr_items',
                            total: 'N/C',
                            tooltip: 'Current number of items stored'
                        },
                        {
                            dataset: getEmptyDataset('Evicted unfetched'),
                            updateMethod: instantValues,
                            updateLabelsMethod: instantValues,
                            totalMethod: getLastValue,
                            memcache_item: 'evicted_unfetched',
                            total: 'N/C',
                            tooltip: ''
                        },
                        {
                            dataset: getEmptyDataset('Evictions'),
                            updateMethod: instantValues,
                            updateLabelsMethod: instantValues,
                            totalMethod: getLastValue,
                            memcache_item: 'evictions',
                            total: 'N/C',
                            tooltip: 'Number of valid items removed from cache to free memory for new items'
                        },
                    ]
                },
                network: {
                    groupName: 'Network',
                    data: [
                        {
                            dataset: getEmptyDataset('Current connections'),
                            updateMethod: instantValues,
                            updateLabelsMethod: instantValues,
                            totalMethod: getLastValue,
                            memcache_item: 'curr_connections',
                            total: 'N/C',
                            tooltip: 'Number of connection structures allocated by the server'
                        },
                        {
                            dataset: getEmptyDataset('Bytes Read (Kb)'),
                            updateMethod: instantKbValues,
                            updateLabelsMethod: instantKbValues,
                            totalMethod: getLastValue,
                            memcache_item: 'bytes_read',
                            total: 'N/C',
                            tooltip: 'Total number of bytes read by this server from network'
                        },
                        {
                            dataset: getEmptyDataset('Bytes Written (Kb)'),
                            updateMethod: instantKbValues,
                            updateLabelsMethod: instantKbValues,
                            totalMethod: getLastValue,
                            memcache_item: 'bytes_written',
                            total: 'N/C',
                            tooltip: 'Total number of bytes sent by this server to network'
                        },
                    ]
                }
            }
        },
        mounted() {
            var root = this;
            var refresh = function() {
                axios.get('/stats').then(function (response) {

                    // Update dataset values
                    for (chartGroup in root.chartDataGroups) {
                        for (groupData in root.chartDataGroups[chartGroup]['data']) {
                            var memcacheItem = root.chartDataGroups[chartGroup]['data'][groupData]['memcache_item'];
                            var method = root.chartDataGroups[chartGroup]['data'][groupData]['updateMethod'];
                            var labelMethod = root.chartDataGroups[chartGroup]['data'][groupData]['updateLabelsMethod'];
                            var totalMethod = root.chartDataGroups[chartGroup]['data'][groupData]['totalMethod'];

                            root.chartDataGroups[chartGroup]['data'][groupData]['total'] = totalMethod(response.data, memcacheItem);
                            root.chartDataGroups[chartGroup]['data'][groupData]['dataset']['labels'] = labelMethod(response.data, memcacheItem);
                            root.chartDataGroups[chartGroup]['data'][groupData]['dataset']['datasets'][0]['data'] = method(response.data, memcacheItem);
                        }
                    }
                });
            };
            setInterval(refresh, 5000);
        }
    });
});