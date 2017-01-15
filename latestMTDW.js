module.exports = {
	monitor: monitor
}

const TODO_JOBS = 'TODO_JOBS';
const DONE_JOBS = 'DONE_JOBS';

const exec = require('child_process').exec;
const redis = require('redis');
const loginAndExec = require('./login.js').remoteExec;

function monitor(opt, cmd){


	let client = redis.createClient(6383, 'mtte');
	let host = opt.host;
	let proc = loginAndExec(opt, cmd);
	let combinedMsg = '';

	proc.on('exit', ()=> {
		setTimeout(()=> {
			client.quit()
		}, 3000);
		//console.log(`${host} exits`)
	});

	proc.stdout.on('data', (data)=>{
		combinedMsg += data.toString();
		let found;
		let nextPos = 0;
		while(found = combinedMsg.substring(nextPos).match(/\/home\/kei\/datalog\/MTDataWriter\/MTData_.*.1st/)) {

			nextPos += found['index'];
			nextPos += found[0].length;

			let key = `${host}:${found[0]}`;
			if(! key.includes('_FH_')) {
				continue;
			}

			if(key.match('en[0-9a-z]_')) {
				continue;
			}


			client.sismember(DONE_JOBS, key, (err,rtn) => {
				if(rtn === 1) {
					return;
				}

				client.sadd(TODO_JOBS, key, (err, rtn) => {
					if(rtn === 1) {
						console.log(`Added ${key} to ${TODO_JOBS}`);
					}
				});
			});
		}

		if(nextPos > 0) {
			combinedMsg = combinedMsg.substring(nextPos);
		}

	});
}


