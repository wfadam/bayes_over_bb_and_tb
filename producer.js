const mtdw = require('./latestMTDW.js');

const cmd = `find /home/kei/datalog/MTDataWriter/ -mtime -30  -name "*.1st"; exit`;
const HOST_LIST = require('./list_of_host.js');

function monitor() {

	console.log(process.memoryUsage());
	for(let host of HOST_LIST.T73) {
		const opt = {
			host: host,
			user: 'kei',
			password: 'keiuser',
		};
		mtdw.monitor(opt, cmd);
	}
}

function start() {
	monitor();
	setInterval(() => monitor(), 20*1000 );
}

exports.start = start;

process.setMaxListeners(0);
process.on('uncaughtException', (err) => {
	console.log( `uncaughtException ${err}` );
});

start();


