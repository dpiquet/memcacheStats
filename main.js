/**
 * Memcached Stats main
 *
 *
 */

'use strict';

const Memcached = require('memcached');
const Sqlite3 = require('sqlite3');
const Express = require('express');

var app = Express();
app.set('view engine', 'pug');
app.set("views", "./views");

app.use(Express.static('assets'));
app.use('/lib/vue', Express.static( './node_modules/vue/dist/'));
app.use('/lib/vue-chartjs', Express.static( './node_modules/vue-chartjs/dist/'));
app.use('/lib/bootstrap', Express.static( './node_modules/bootstrap/dist/'));
app.use('/lib/axios', Express.static( './node_modules/axios/dist/'));
app.use('/lib/chart.js', Express.static( './node_modules/chart.js/dist/'));
app.use('/lib/vuechart', Express.static( './node_modules/vuechart/'));

var config = require('./config');

// Use env settings instead of file if available
if (process.env.MEMCACHESTATS_HOST != undefined) {
    config.memcache.host = process.env.MEMCACHESTATS_HOST;
}

if (process.env.MEMCACHESTATS_PORT != undefined) {
    config.memcache.port = process.env.MEMCACHESTATS_PORT;
}

var memcached = new Memcached(config.memcache.host+':'+config.memcache.port);
var db = new Sqlite3.Database(config.database.filename+'.sqlite3');

db.serialize(function () {

    db.run('CREATE TABLE IF NOT EXISTS stats(' +
        'id integer PRIMARY KEY AUTOINCREMENT, \n' +
        'uptime integer, \n' +
        'time  integer,\n' +
        'pointer_size  integer,\n' +
        'rusage_user real,\n' +
        'rusage_system real,\n' +
        'max_connections  integer,\n' +
        'curr_connections  integer,\n' +
        'total_connections  integer,\n' +
        'rejected_connections  integer,\n' +
        'connection_structures  integer,\n' +
        'reserved_fds  integer,\n' +
        'cmd_get  integer,\n' +
        'cmd_set  integer,\n' +
        'cmd_flush  integer,\n' +
        'cmd_touch  integer,\n' +
        'get_hits  integer,\n' +
        'get_misses  integer,\n' +
        'get_expired  integer,\n' +
        'get_flushed  integer,\n' +
        'delete_misses  integer,\n' +
        'delete_hits  integer,\n' +
        'incr_misses  integer,\n' +
        'incr_hits  integer,\n' +
        'decr_misses  integer,\n' +
        'decr_hits  integer,\n' +
        'cas_misses  integer,\n' +
        'cas_hits  integer,\n' +
        'cas_badval  integer,\n' +
        'touch_hits  integer,\n' +
        'touch_misses  integer,\n' +
        'auth_cmds  integer,\n' +
        'auth_errors  integer,\n' +
        'bytes_read  integer,\n' +
        'bytes_written  integer,\n' +
        'limit_maxbytes  integer,\n' +
        'accepting_conns  integer,\n' +
        'listen_disabled_num  integer,\n' +
        'time_in_listen_disabled_us  integer,\n' +
        'threads  integer,\n' +
        'conn_yields  integer,\n' +
        'hash_power_level  integer,\n' +
        'hash_bytes  integer,\n' +
        'hash_is_expanding  integer,\n' +
        'slab_reassign_rescues  integer,\n' +
        'slab_reassign_chunk_rescues  integer,\n' +
        'slab_reassign_evictions_nomem  integer,\n' +
        'slab_reassign_inline_reclaim  integer,\n' +
        'slab_reassign_busy_items  integer,\n' +
        'slab_reassign_busy_deletes  integer,\n' +
        'slab_reassign_running  integer,\n' +
        'slabs_moved  integer,\n' +
        'lru_crawler_running  integer,\n' +
        'lru_crawler_starts  integer,\n' +
        'lru_maintainer_juggles  integer,\n' +
        'malloc_fails  integer,\n' +
        'log_worker_dropped  integer,\n' +
        'log_worker_written  integer,\n' +
        'log_watcher_skipped  integer,\n' +
        'log_watcher_sent  integer,\n' +
        'bytes  integer,\n' +
        'curr_items  integer,\n' +
        'total_items  integer,\n' +
        'slab_global_page_pool  integer,\n' +
        'expired_unfetched  integer,\n' +
        'evicted_unfetched  integer,\n' +
        'evicted_active  integer,\n' +
        'evictions  integer,\n' +
        'reclaimed  integer,\n' +
        'crawler_reclaimed  integer,\n' +
        'crawler_items_checked  integer,\n' +
        'lrutail_reflocked  integer,\n' +
        'moves_to_cold  integer,\n' +
        'moves_to_warm  integer,\n' +
        'moves_within_lru  integer,\n' +
        'direct_reclaims  integer,\n' +
        'lru_bumps_dropped  integer' +
        ')');

    db.run('CREATE TABLE IF NOT EXISTS stats_items(' +
        '           id integer PRIMARY KEY AUTOINCREMENT, \n' +
        '           timestamp integer, \n' +
        '           slab integer, \n' +
        '           number integer, \n' +
        '           number_hot integer, \n' +
        '           number_warm integer, \n' +
        '           number_cold integer, \n' +
        '           age_hot integer, \n' +
        '            age_warm integer,\n' +
        '            age integer,\n' +
        '            evicted integer,\n' +
        '            evicted_nonzero integer,\n' +
        '            evicted_time integer, \n' +
        '            outofmemory integer,\n' +
        '            tailrepairs integer,\n' +
        '            reclaimed integer, \n' +
        '            expired_unfetched integer,\n' +
        '            evicted_unfetched integer,\n' +
        '            evicted_active integer,\n' +
        '            crawler_reclaimed integer,\n' +
        '            crawler_items_checked integer,\n' +
        '            lrutail_reflocked integer,\n' +
        '            moves_to_cold integer, \n' +
        '            moves_to_warm integer,\n' +
        '            moves_within_lru integer,\n' +
        '            direct_reclaims integer,\n' +
        '            hits_to_hot integer, \n' +
        '            hits_to_warm integer,\n' +
        '            hits_to_cold integer,\n' +
        '            hits_to_temp integer' +
        ')');
});

memcached.version(function(err, version) { console.log(version); });

app.get('/items', function(req, res) {
    db.all('select * from stats_items where timestamp > ' + (Date.now() - 9000).toString(), function(err, rows) {
        res.send(JSON.stringify(rows));
    });
});

app.get('/stats', function(req, res) {
    db.all('select * from (select * from stats order by id DESC LIMIT 100) order by id ASC', function (err, rows) {
        res.send(JSON.stringify(rows));
    });
});

app.get('/flush', function(req, res) {
    memcached.flush(function() {
        res.redirect('/');
    });

});

app.get('/', function(req, res) {
    res.render('index');
});

app.listen(config.listenPort);

/**
 * Save items stats
 * @param err
 * @param items
 */
function persistItemsStats(err, items) {
    var statement = db.prepare(
        'insert into stats_items(timestamp , ' +
        '        slab, ' +
        '        number, ' +
        '        number_hot, ' +
        '        number_warm, ' +
        '        number_cold, ' +
        '        age_hot, ' +
        '        age_warm, ' +
        '        age, ' +
        '        evicted, ' +
        '        evicted_nonzero, ' +
        '        evicted_time, ' +
        '        outofmemory, ' +
        '        tailrepairs, ' +
        '        reclaimed, ' +
        '        expired_unfetched, ' +
        '        evicted_unfetched, ' +
        '        evicted_active, ' +
        '        crawler_reclaimed, ' +
        '        crawler_items_checked, ' +
        '        lrutail_reflocked, ' +
        '        moves_to_cold, ' +
        '        moves_to_warm, ' +
        '        moves_within_lru, ' +
        '        direct_reclaims, ' +
        '        hits_to_hot, ' +
        '        hits_to_warm, ' +
        '        hits_to_cold, ' +
        '        hits_to_temp ' +
        '        ) ' +
        'values (?, ? ,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
    );

    items.forEach(function(item) {
        for (var slab in item) {

            statement.run(
                Date.now(),
                slab,
                item[slab]['number'],
                item[slab]['number_hot'],
                item[slab]['number_warm'],
                item[slab]['number_cold'],
                item[slab]['age_hot'],
                item[slab]['age_warm'],
                item[slab]['age'],
                item[slab]['evicted'],
                item[slab]['evicted_nonzero'],
                item[slab]['evicted_time'],
                item[slab]['outofmemory'],
                item[slab]['tailrepairs'],
                item[slab]['reclaimed'],
                item[slab]['expired_unfetched'],
                item[slab]['evicted_unfetched'],
                item[slab]['evicted_active'],
                item[slab]['crawler_reclaimed'],
                item[slab]['crawler_items_checked'],
                item[slab]['lrutail_reflocked'],
                item[slab]['moves_to_cold'],
                item[slab]['moves_to_warm'],
                item[slab]['moves_within_lru'],
                item[slab]['direct_reclaims'],
                item[slab]['hits_to_hot'],
                item[slab]['hits_to_warm'],
                item[slab]['hits_to_cold'],
                item[slab]['hits_to_temp']
            );

        }
    });
}

function persistStats(err, allStats) {
    var statement = db.prepare('insert into stats(' +
        'uptime,\n' +
        'time,\n' +
        'pointer_size,\n' +
        'rusage_user,\n' +
        'rusage_system,\n' +
        'max_connections,\n' +
        'curr_connections,\n' +
        'total_connections,\n' +
        'rejected_connections,\n' +
        'connection_structures,\n' +
        'reserved_fds,\n' +
        'cmd_get,\n' +
        'cmd_set,\n' +
        'cmd_flush,\n' +
        'cmd_touch,\n' +
        'get_hits,\n' +
        'get_misses,\n' +
        'get_expired,\n' +
        'get_flushed,\n' +
        'delete_misses,\n' +
        'delete_hits,\n' +
        'incr_misses,\n' +
        'incr_hits,\n' +
        'decr_misses,\n' +
        'decr_hits,\n' +
        'cas_misses,\n' +
        'cas_hits  ,\n' +
        'cas_badval  ,\n' +
        'touch_hits  ,\n' +
        'touch_misses  ,\n' +
        'auth_cmds  ,\n' +
        'auth_errors  ,\n' +
        'bytes_read  ,\n' +
        'bytes_written  ,\n' +
        'limit_maxbytes  ,\n' +
        'accepting_conns  ,\n' +
        'listen_disabled_num  ,\n' +
        'time_in_listen_disabled_us  ,\n' +
        'threads  ,\n' +
        'conn_yields  ,\n' +
        'hash_power_level  ,\n' +
        'hash_bytes  ,\n' +
        'hash_is_expanding  ,\n' +
        'slab_reassign_rescues  ,\n' +
        'slab_reassign_chunk_rescues  ,\n' +
        'slab_reassign_evictions_nomem  ,\n' +
        'slab_reassign_inline_reclaim  ,\n' +
        'slab_reassign_busy_items  ,\n' +
        'slab_reassign_busy_deletes  ,\n' +
        'slab_reassign_running  ,\n' +
        'slabs_moved  ,\n' +
        'lru_crawler_running  ,\n' +
        'lru_crawler_starts  ,\n' +
        'lru_maintainer_juggles  ,\n' +
        'malloc_fails  ,\n' +
        'log_worker_dropped  ,\n' +
        'log_worker_written  ,\n' +
        'log_watcher_skipped  ,\n' +
        'log_watcher_sent  ,\n' +
        'bytes  ,\n' +
        'curr_items  ,\n' +
        'total_items  ,\n' +
        'slab_global_page_pool  ,\n' +
        'expired_unfetched  ,\n' +
        'evicted_unfetched  ,\n' +
        'evicted_active  ,\n' +
        'evictions  ,\n' +
        'reclaimed  ,\n' +
        'crawler_reclaimed  ,\n' +
        'crawler_items_checked  ,\n' +
        'lrutail_reflocked  ,\n' +
        'moves_to_cold  ,\n' +
        'moves_to_warm  ,\n' +
        'moves_within_lru  ,\n' +
        'direct_reclaims  ,\n' +
        'lru_bumps_dropped' +
        ')' +
        'values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
    );

    allStats.forEach(function (stats) {

        statement.run(
            stats['uptime'],
            stats['time'],
            stats['pointer_size'],
            stats['rusage_user'],
            stats['rusage_system'],
            stats['max_connections'],
            stats['curr_connections'],
            stats['total_connections'],
            stats['rejected_connections'],
            stats['connection_structures'],
            stats['reserved_fds'],
            stats['cmd_get'],
            stats['cmd_set'],
            stats['cmd_flush'],
            stats['cmd_touch'],
            stats['get_hits'],
            stats['get_misses'],
            stats['get_expired'],
            stats['get_flushed'],
            stats['delete_misses'],
            stats['delete_hits'],
            stats['incr_misses'],
            stats['incr_hits'],
            stats['decr_misses'],
            stats['decr_hits'],
            stats['cas_misses'],
            stats['cas_hits'],
            stats['cas_badval'],
            stats['touch_hits'],
            stats['touch_misses'],
            stats['auth_cmds'],
            stats['auth_errors'],
            stats['bytes_read'],
            stats['bytes_written'],
            stats['limit_maxbytes'],
            stats['accepting_conns'],
            stats['listen_disabled_num'],
            stats['time_in_listen_disabled_us'],
            stats['threads'],
            stats['conn_yields'],
            stats['hash_power_level'],
            stats['hash_bytes'],
            stats['hash_is_expanding'],
            stats['slab_reassign_rescues'],
            stats['slab_reassign_chunk_rescues'],
            stats['slab_reassign_evictions_nomem'],
            stats['slab_reassign_inline_reclaim'],
            stats['slab_reassign_busy_items'],
            stats['slab_reassign_busy_deletes'],
            stats['slab_reassign_running'],
            stats['slabs_moved'],
            stats['lru_crawler_running'],
            stats['lru_crawler_starts'],
            stats['lru_maintainer_juggles'],
            stats['malloc_fails'],
            stats['log_worker_dropped'],
            stats['log_worker_written'],
            stats['log_watcher_skipped'],
            stats['log_watcher_sent'],
            stats['bytes'],
            stats['curr_items'],
            stats['total_items'],
            stats['slab_global_page_pool'],
            stats['expired_unfetched'],
            stats['evicted_unfetched'],
            stats['evicted_active'],
            stats['evictions'],
            stats['reclaimed'],
            stats['crawler_reclaimed'],
            stats['crawler_items_checked'],
            stats['lrutail_reflocked'],
            stats['moves_to_cold'],
            stats['moves_to_warm'],
            stats['moves_within_lru'],
            stats['direct_reclaims'],
            stats['lru_bumps_dropped']
        );
    });
}

function queryStats() {
    memcached.items(persistItemsStats);
    memcached.stats(persistStats);
}

setInterval(queryStats, 1000);