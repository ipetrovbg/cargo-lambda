'use strict';
const path = require('path');
const archiver = require('archiver');
const fs = require('fs');

class CargoLambdaServerless {
	constructor(serverless, _, { log, progress }) {
		this.functions = serverless.service.functions;
		this.log = log;
		this.serverless = serverless;

		progress.create({
			message: 'Changing packaging path',
			name: 'cargo-lambda',
		});

		log.notice('cargo-lambda')

		this.hooks = {
			'after:package:finalize': this.zip,
		}
	}

	zip = () => {
		Object.keys(this.functions)
			.filter(func => this.functions[func].cargo)
			.forEach((func) => {
			this.zipFunction(func)
		})
	}

	zipFunction = (func) => {
		const funcObject = this.functions[func];
		const log = this.log;
		const artifact = path.posix.join(this.serverless.config.servicePath, '.serverless', func + '.zip')
		const output = fs.createWriteStream(artifact);
		const archive = archiver('zip', {
			zlib: { level: 9 }
		});

		output.on('close', function() {
			log.success(artifact, archive.pointer(), 'total bytes')
		});

		output.on('end', function() {
			log.notice('Data has been drained');
		});

		archive.on('warning', function(err) {
			if (err.code === 'ENOENT') {
				log.warning(err)
			} else {
				log.error(err)
				throw err;
			}
		});

		archive.on('error', function(err) {
			throw err;
		});

		archive.pipe(output);

		const file = this.serverless.config.servicePath + `/${funcObject.cargo.path}`;
		archive.append(fs.createReadStream(file), { name: 'bootstrap' });
		archive.finalize();
	}
}

module.exports = CargoLambdaServerless;
