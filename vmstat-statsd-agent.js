#!/usr/bin/node
var child_process = require('child_process'),
        Configuration = require('cfig'),
        Stream = require('stream'),
        Statsy = require('statsy');

var defaults = {
    host: 'ustatsd.timboudreau.org',
    port: 8125,
    tcp: false,
    vmstat: '/usr/bin/vmstat',
    prefix: 'test',
    delay: 10,
    mapping: {
        r: 'runnable',
        b: 'sleeping',
        si: 'swappedIn',
        so: 'swappedOut',
        bi: 'blocksIn',
        bo: 'blocksOut',
        in: 'interruptsPerSecond',
        cs: 'contextSwitchesPerSecond',
        us: 'userTime',
        sy: 'kernelTime',
        id: 'idleTime',
        wa: 'ioWaitTime',
        st: 'timeStolen'
    }
};
var names = [
    'r', 'b', 'swpd', 'free', 'buff', 'cache', 'si', 'so', 'bi', 'bo', 'in', 'cs', 'us', 'sy', 'id', 'wa', 'st'
];

console.log(JSON.stringify(defaults, null, 100))

var statsLineRegex = /\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)$/;

new Configuration(defaults, onConfigurationLoaded, 'vmstat-statsd-agent', false);

function onConfigurationLoaded(err, config) {
    if (err) {
        throw err;
    }
    var statsd = new Statsy(config);

    var vmstatCommandline = config.vmstat + ' ' + config.delay;
    var proc = child_process.exec(vmstatCommandline);
    var stream = lineStream();
    // 17 integer fields per vmstat output line
    stream.on('data', function (line) {
        if (statsLineRegex.test(line)) {
            var res = statsLineRegex.exec(line);
            for (var i = 0; i < names.length; i++) {
                if (typeof res[i + 1] !== 'undefined') {
                    var name = names[i];
                    var displayName = config.mapping[names[i]];
                    if (displayName) {
                        console.log(displayName + ": " + res[i + 1]);
                        statsd.gauge(displayName, parseInt(res[i + 1]));
                    }
                }
            }
        }
    });

    proc.stdout.pipe(stream);
}

function lineStream() {
    var xformStream = new Stream.Transform({objectMode: true});
    xformStream._transform = function (chunk, encoding, done) {
        var data = chunk.toString();
        if (this._lastLineData) {
            data = this._lastLineData + data;
        }
        var lines = data.split('\n');
        this._lastLineData = lines.splice(lines.length - 1, 1)[0];
        lines.forEach(this.push.bind(this));
        done();
    };
    xformStream._flush = function (done) {
        if (this._lastLineData) {
            this.push(this._lastLineData);
        }
        this._lastLineData = null;
        done();
    };
    return xformStream;
}
