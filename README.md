VMStat Statsd Agent
===================

Publishes vmstat info to a statsd instance, to graph system performance data.

Usage
-----

		 vmstat-statsd-agent --host statsd.your.domain.com --port 8125 --vmstat /usr/bin/vmstat --prefix test --delay 10 --tcp false

The application will run forever;  simply kill it to stop sending stats.

To install it, simply clone this repository and run `npm install` in the resulting directory.

Caveats
-------

Statsd uses UDP.  That means packets are fire-and-forget.  That's good, but it also means
if the statsd server is down, this application will not notice.

Configuration
-------------
All of the above configuration items could also be put in a JSON file in /ect/vmstat-statsd-agent.json (command-line args will override if present).  Possible values:

 - **host** - the statsd host
 - **port** - the statsd port - default `8125`
 - **tcp** - true/false - use TCP instead of UDP to send stats to statsd - default `false`
 - **prefix** - prefix to prepend to stats, for use in graphite's ui - default `test`
 - **vmstat** - the path to `vmstat`, default `/usr/bin/vmstat`

If you use a JSON configuration file, you can also specify which stats are transmitted and what names are used for them.  The defaults map names of
output as shown in vmstats default output to friendly names used in stats.  If you do not want to publish a 
particular stat, simply remove it from the `mapping` portion of the config.


		{
			  "host": "ustatsd.timboudreau.org",
			  "port": 8125,
			  "tcp": false,
			  "vmstat": "/usr/bin/vmstat",
			  "prefix": "test",
			  "delay": 10,
			  "mapping": {
				    "r": "runnable",
				    "b": "sleeping",
				    "si": "swappedIn",
				    "so": "swappedOut",
				    "bi": "blocksIn",
				    "bo": "blocksOut",
				    "in": "interruptsPerSecond",
				    "cs": "contextSwitchesPerSecond",
				    "us": "userTime",
				    "sy": "kernelTime",
				    "id": "idleTime",
				    "wa": "ioWaitTime",
				    "st": "timeStolen"
			  }
		}

![Screen Shot](screen.gif "Graphite Screen Shot")
