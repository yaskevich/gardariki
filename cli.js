const path = require('path');
const axios = require('axios');
const fs = require('fs');
const pr = require('./processing');
const cfg = pr.init();

if (process.argv.length > 2 && process.argv[2] == "cron") {
	pr.logger.level = "warn";	
}


axios.get('http://localhost:4141')
    .then(resp => {
        pr.logger.info(`Backend status ${resp.status}`);
		if (resp.status === 200){
			pr.logger.info("Querying backend...");
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
			});	
			pr.generateListOfCities (true).then(() => pr.logger.info("list done"));			
		}
    })
    .catch(err => {
       pr.logger.error("Backend is not available!");
    });





