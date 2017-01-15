const getBB = require('./tb_and_bb.js');

function start() {
	getBB.monitor();
	setInterval(() => {
		console.log(process.memoryUsage());
		getBB.monitor();
	}, 6*1000 )

}

exports.start = start;

process.setMaxListeners(0);
process.on('uncaughtException', (err) => {
	console.log( `uncaughtException ${err}` );
});

start();
