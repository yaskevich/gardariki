const path = require('path');
const fs = require('fs');
const pr = require('./processing');
const cfg = pr.init();

if (process.argv.length > 2 && process.argv[2] == "cron") {
	pr.logger.level = "warn";	
}

pr.getAllCities().then(function(result) {
	const items = result.data;
	const ids = items
		.map((x) => cfg.front.languages
			.map((l) => pr.generateCityModal(l, x.id, true)
				.then(() => pr.logger.info(`done ${l} ${x.id}`) )
				)
			);
	Promise.all(ids.flat())
		.then(() => pr.logger.info(`modals done [${items.length}]`) )
	;
	// console.log(`generated   items`);
});
pr.generateListOfCities (true).then(() => pr.logger.info("list done"));
