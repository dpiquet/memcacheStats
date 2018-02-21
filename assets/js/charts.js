
// Global vars
var charts = {};

/**
 * Get values from datas returned by /items
 *
 * @param key
 * @param datas
 * @returns {Array}
 */
function getValues(key, datas) {
    ret = [];

    for (data in datas) {
        ret.push(datas[data][key]);
    }

    return ret;
}

function registerDataset(items) {

    /**
    var keys = [
        'get_misses',
        'get_hits',
        'bytes_read',
        'bytes_written',

    ];
     **/

    var keys = [
        'uptime',
        'time',
        'pointer_size',
        'rusage_user',
        'rusage_system',
        'max_connections',
        'curr_connections',
        'total_connections',
        'rejected_connections',
        'connection_structures',
        'reserved_fds',
        'cmd_get',
        'cmd_set',
        'cmd_flush',
        'cmd_touch',
        'get_hits',
        'get_misses',
        'get_expired',
        'get_flushed',
        'delete_misses',
        'delete_hits',
        'incr_misses',
        'incr_hits',
        'decr_misses',
        'decr_hits',
        'cas_misses',
        'cas_hits',
        'cas_badval',
        'touch_hits',
        'touch_misses',
        'auth_cmds',
        'auth_errors',
        'bytes_read',
        'bytes_written',
        'limit_maxbytes',
        'accepting_conns',
        'listen_disabled_num',
        'time_in_listen_disabled_us',
        'threads',
        'conn_yields',
        'hash_power_level',
        'hash_bytes',
        'hash_is_expanding',
        'slab_reassign_rescues',
        'slab_reassign_chunk_rescues',
        'slab_reassign_evictions_nomem',
        'slab_reassign_inline_reclaim',
        'slab_reassign_busy_items',
        'slab_reassign_busy_deletes',
        'slab_reassign_running',
        'slabs_moved',
        'lru_crawler_running',
        'lru_crawler_starts',
        'lru_maintainer_juggles',
        'malloc_fails',
        'log_worker_dropped',
        'log_worker_written',
        'log_watcher_skipped',
        'log_watcher_sent',
        'bytes',
        'curr_items',
        'total_items',
        'slab_global_page_pool',
        'expired_unfetched',
        'evicted_unfetched',
        'evicted_active',
        'evictions',
        'reclaimed',
        'crawler_reclaimed',
        'crawler_items_checked',
        'lrutail_reflocked',
        'moves_to_cold',
        'moves_to_warm',
        'moves_within_lru',
        'direct_reclaims',
        'lru_bumps_dropped'
    ];

    for (a = 0; a< keys.length; a++) {

        var key = keys[a];

        var datasets = [];
        var labels = [];
        var tmp_dsets = [];

        for (item of items) {
            tmp_dsets.push(item);
        }

        datasets.push({
            'label': key,
            'data': getValues(key, tmp_dsets),
            'showLine': true
        });

        labels = getValues(key, tmp_dsets);

        drawChart(key, datasets, labels);
    }
}

function drawChart(chartId, datasets, labels) {

    var myChart;

    if (charts.hasOwnProperty(chartId)) {
        myChart = charts[chartId];
        myChart.data.datasets = datasets;
        myChart.update();

    } else {
        var canvas = jQuery('#'+chartId);
        if (canvas.length < 1) {
            jQuery('body').append('<div class="canvas-container"><canvas id="'+chartId+'" width="400" height="200"></canvas></div>');
            canvas = jQuery('#'+chartId);
        }

        var ctx = document.getElementById(chartId).getContext('2d');
        ctx.canvas.width = 400;
        ctx.canvas.height = 200;

        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                pointRadius: 0,
                animation: false
            }
        });

        charts[chartId] = myChart;
    }


}

jQuery('document').ready(function() {

    setInterval(function() {
        jQuery.ajax({
            'url': '/stats',
            'success': function (d) {
                var data = JSON.parse(d);
                registerDataset(data);
            },
            'error': function (err) {
                console.log(err);
            }
        });
    }, 1000);
});