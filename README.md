# Gardariki
The project presents the Belarusian cities which were granted with the privillege to self-govern by Magdeburg Law.

### Project structure
1. frontend server and static site generator (this repo)
2. backend server: API to PostgreSQL storage ([repo](https://github.com/yaskevich/gardariki-strapi))
3. directory of static images ([repo](https://github.com/yaskevich/gardariki-data))

#### The content of this repository
- draft of the custom landing
- Tilda-generated landing
- Leafletjs-based interactive map application
- server application that connects to the [API](https://github.com/yaskevich/gardariki-strapi)
- CLI tool for generating static version of the project


#### `.env` variables

`MAIN_SITE` &ndash; cached routes

`TEST_SITE` &ndash; direct routes to API

`SERVER_PORT` &ndash; frontend server port

`API_PORT` &ndash; [backend](https://github.com/yaskevich/gardariki-strapi) port

#### CLI options
- `--quiet` &ndash; Show only important warnings
- `--static` &ndash; Generate static cache
- `--inline` &ndash; Generate inline HTML of the map
