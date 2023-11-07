import args from 'args';
import pr from './processing.js';

args // (e.g. when running under cron)
  .option('quiet', 'Show only important warnings', false)
  .option('static', 'Generate static cache', false)
  .option('inline', 'Generate inline HTML of the map', false)
  .option('fetch', 'Fetch Magdeburg Law data', false);

const flags = args.parse(process.argv);
// console.log(flags);

if (flags.quiet) {
  pr.logger.level = 'warn';
}

if (flags.static) {
  pr.buildAllModals();
}

// server should be online
if (flags.inline) {
  await pr.buildInlineMap();
}

if (flags.fetch) {
  await pr.getMagdeburg(flags.quiet);
}
