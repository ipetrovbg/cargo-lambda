'use strict';
const path = require('path');
const archiver = require('archiver');
const fs = require('fs');

class CargoLambda {
	constructor(serverless, options, { log, progress }) {
		this.options = options;
		this.cwd = process.cwd();
		this.functions = serverless.service.functions;
		this.serverless = serverless;
		this.log = log;


		const cargoProgress = progress.create({
			message: 'Changing packaging path',
			name: 'cargo-lambda',
		});

		log.info('cargo-lambda')

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
		const output = fs.createWriteStream(funcObject.package.artifact);
		const archive = archiver('zip', {
			zlib: { level: 9 }
		});

		output.on('close', function() {
			log.success(funcObject.package.artifact, archive.pointer(), 'total bytes')
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

		const file = __dirname + `/${funcObject.cargo.path}`;
		archive.append(fs.createReadStream(file), { name: 'bootstrap' });
		archive.finalize();
	}
}

module.exports = CargoLambda;
