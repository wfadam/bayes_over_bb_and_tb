module.exports = {
	monitor: monitor
}

const redis = require('redis');
const path = require('path');
const loginAndExec = require('./login.js').remoteExec;

const TODO_JOBS = 'TODO_JOBS';
const DONE_JOBS = 'DONE_JOBS';

const itemRegex = /\n(BB|TB):.*\r/;
const tbLine = /TB:.*/;
const bbLine = /BB:.*/;
const fileRegex = /MTdata.*.txt/;


function monitor() {
	let client = redis.createClient(6383, 'mtte');
	client.spop(TODO_JOBS, (err, key) => {
		if(err) {
			console.log(err);
			client.quit();
			return;
		}

		if(! key ) {
			client.quit();
			return;
		}

		const arr = key.split(':');
		const host = arr[0];
		const file = arr[1];

		const opt = {
			host: host,
			user: 'kei',
			password: 'keiuser',
		};

		let cmd = `grep -P '^(BB|TB|TBTestTime):.*' ${file}; exit`;
		let proc = loginAndExec(opt, cmd);

		proc.on('exit', ()=> {
			client.sadd(DONE_JOBS, key);
			setTimeout(() => client.quit(), 2000);
		});

		drain(proc, client, `${file}:${host}`);

	});

}

function drain(proc, client, absPath) {
	const mtdwFile =  path.basename(absPath);
	const memory = mtdwFile.slice(7,10); // get a substring 't0h' from 'MTData_t0h3456af1107_738c'

	let tbCnt = 0;
	proc.on('exit', ()=> {
		console.log(`Observed ${tbCnt} in ${mtdwFile}`);
	});

	let combinedMsg = '';
	proc.stdout.on('data', (data)=>{
		combinedMsg += data.toString();

		let tbName = undefined;
		let isFail = false;
		let msg = combinedMsg;
		let found;
		let nextPos = 0;
		while(found = msg.substring(nextPos).match(itemRegex)) {
			let item = found[0].trim();

			if(item.match(tbLine)){
				if(isFail && tbName) {
					isFail = false;
				}

				tbName = item;
				++tbCnt;
				//console.log(tbName);
			}

			if(tbName && item.match(bbLine)){
				let bbL = item.split(/[ \t]+/);
				if(4 < bbL.length) {
					isFail = true;
					bbL.shift();
					bbL.shift();
					bbL.shift();
					for( let bb of bbL ) {
						if(bb) {
							client.hincrby( `BB:${memory}:${bb}`, tbName, 1);
							client.hincrby( `${tbName}`, `${memory}:${bb}`, 1);
						}
					}
					client.hincrby( `FAIL:${tbName}`, memory, 1);
				}
				client.hincrby( `ALL:${tbName}`, memory, 1);
			}

			nextPos += found['index'];
			nextPos += found[0].length;
		}

		if(nextPos > 0) {
			combinedMsg = combinedMsg.substring(nextPos);
		}

	});
}

