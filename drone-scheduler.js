// TODO: assumes input files are in the same directory

let configuration = require('./config');

let drones;
let locations;

let dronesByWeight = [];

async function initialize(debug) {
	let config = await configuration();
	drones = config.drones;
	locations = config.locations;

	drones.sort((a, b) => {
		//console.log(`drones? a`, a, '?', 'b', b, b.weight - a.weight);
		return b.weight - a.weight;
	});

	locations.sort((a, b) => {
		return b.weight - a.weight;
	});

	if (debug) {
		console.log('drones:', drones);
		console.log('locations:', locations);
	}
}

class Bucket {
	constructor(name, maxWeight, drone) {
		this.name = name;
		this.maxWeight = maxWeight;
		this.drone = drone;

		this.current = 0;
		this.locations = [];
	}

	add(location) {
		let added;

		let newWeight = this.current + location.weight;
		let previous = this.current;
		if (newWeight <= this.maxWeight) {
			this.current = newWeight;
			this.locations.push(location);
			this.drone.trips.push(location); // wrong
			added = true;
		} else {
			added = false;
		}

		//console.log(`Bucket.add(${this.name}, ${this.maxWeight})`, location, `${previous}->${this.current} new=${newWeight} added?=${added}`);
		return added;
	};
}

let trips = [];

function createBuckets() {
	return drones.map((drone) => {
		return new Bucket(drone.name, drone.weight, drone);
		/*buckets.push({
			name: drone.name,
			max: drone.weight,
			used: 0
		});*/
	});
}

async function process(debug) {
	await initialize();

	let buckets = createBuckets();
	let filled = [];
	if (debug) {
		console.log('buckets:', buckets);
	}

	let tripCounter = 0;
	let bucketIdx = 0;
	let trip = {
		filled
	};
	trips.push(trip);
	do {
		let location = locations[0];

		let bucket = buckets[0];
		if (bucket.add(location)) {
			locations.splice(0, 1);
		} else {
//			bucketIdx++;
			// remove bucket from list
			filled.push(bucket);
			buckets.splice(0, 1);

			if (buckets.length === 0) {
//			if (bucketIdx >= bucket.length) {
				// out of buckets, new trip
				// new set of buckets
				buckets = createBuckets();
				trip = {
					buckets
				};
				trips.push(trip);
			}
		}
	} while (locations.length > 0);

	if (debug) {
		console.log('filled:');
		filled.forEach((bucket, index) => {
			console.log(`@${index} filled`, bucket);
		});
//	console.log('buckets:', buckets);
		buckets.forEach((bucket, index) => {
			console.log(`@${index} !filled`, bucket);
		});

		console.log(`trips`, trips);
	}

	drones.forEach((drone, index) => {
		if (drone.trips.length > 0) {
			if (index > 0) {
				console.log(`\n\n`);
			}

			console.log(`${drone.name}`);
			console.log();
			drone.trips.forEach((trip, tripIndex) => {
				console.log(`Trip ${tripIndex + 1}`, trip);
			});
		}
	});
} // process

process();
