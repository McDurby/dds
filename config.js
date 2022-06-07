let events = require('events');
let fs = require('fs');
let readline = require('readline');

let params = process.argv.slice(2);

if (process.argv.length < 3) {
	console.error(`\nmissing input file\n`);
	process.exit(1);
}

let inputFilename = params[0];

// for production, confirm file existence using fs


// objects of { name(string), weight(number) }
let drones = [];

// objects of { name(string), package-weight(number) }
let locations = [];

async function load(cb) {
	const reader = readline.createInterface({
		input: fs.createReadStream(inputFilename)
	});

	// this would remove whitespace in the drone/location names
	//const NO_WHITESPACE = RegExp(/ /g);

	let lineNumber = 0;
	reader.on('line', (line) => {
		//console.log(`@${lineNumber} line:`, line);

		if (lineNumber === 0) {
			// drones
	//		line = line.replace(NO_WHITESPACE, '');
			let obj = line.split(",");
			// use for loop, forEach/map is single element
			for (let idx = 0; idx < obj.length - 1; idx += 2) {
				drones.push({
					name: obj[idx].trim(),
					weight: Number(obj[idx + 1]),
					trips: []
				});
			}
		} else {
			// locations
			let obj = line.split(",");
			locations.push({
				location: obj[0].trim(),
				weight: Number(obj[1].trim())
			});
		}
		lineNumber++;
	});

	await events.once(reader, 'close');

	console.log('done');

	return {
		drones,
		locations
	};

	//reader.on('close', () => {
		//console.log('drones:', drones);
		//console.log('locations:', locations);
	//});
}

module.exports = load;