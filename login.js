const exec = require('child_process').exec;

exports.remoteExec = (opt, cmd) => {
	let proc = exec(`telnet ${opt.host}`);
//	process.on('exit', () => proc.kill());
	proc.on('error', () => console.log(`${opt.host} is unreachable`()));

	setTimeout(	() => proc.stdin.write(Buffer.from(`${opt.user}\n`)), 1000);
	setTimeout(	() => proc.stdin.write(Buffer.from(`${opt.password}\n`)), 2000);
	setTimeout(	() => proc.stdin.write(Buffer.from(`${cmd}\n`)), 3000);
	return proc
}


