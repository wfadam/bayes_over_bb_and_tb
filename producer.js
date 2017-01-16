const mtdw = require('./latestMTDW.js');

const cmd = `find /home/kei/datalog/MTDataWriter/ -mtime -7  -name "*.1st"; exit`;  // search files modified in the last X days
//const cmd = `cd /home/kei/datalog/MTDataWriter/; touch -t 201612010000 start; touch -t 201612310000 stop; find /home/kei/datalog/MTDataWriter/ -newer start \! -newer stop -name "*.1st"; exit`;
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


