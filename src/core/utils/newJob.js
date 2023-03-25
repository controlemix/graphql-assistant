
const yaml = require('yamljs');
const clc = require('cli-color');
const path = require('path');
// const sequence = require('promise-sequence/lib/sequence');
// const { genList, extension, forwardArgs, fixed, lowerCaseFirstLetter, upperCaseFirstLetter, genListSuper, sleep } = require('./constants');
// const { writeFile } = require('./fs');
const { showCostTime } = require('@lzwme/dir-fast-copy/dist/utils');
const { newScript } = require('../scripts/newScript');

const stampJob = (defs, position) => {
  const { appName, pathBase, startTimeJob } = defs;
  if (position === 'start') {
    console.log(clc.magentaBright('BUILD -----------------  PROJS:   [X]'));
    console.log(clc.magentaBright('-----------------------  REPOS:   [ ]'));
    console.log(`Project     : ${appName}`);
    console.log(`Path        : ${pathBase}`);
    console.log('');
    console.log('working, please await...');
  }
  if (position === 'center') {
    console.log('');
    console.log(`Build:`);
    console.log('-------------------------------------');
  }
  if (position === 'end') {
    console.log('');
    console.log('job done in '+ showCostTime(startTimeJob));
    console.log(clc.magentaBright('-------------------------------------'));
    console.log('');
  }
}

const newJob = async (options) => {

  const yargs = require('yargs');
  const inquirer = require('inquirer');
  
  const sing = () => console.log('🎵 Oy oy oy');
  
  const askName = async () => {
    const answers = await inquirer.prompt([
      {
        message: 'What is your name?',
        name: 'name',
        type: 'string'
      }
    ]);
  
    console.log(`Hello, ${answers.name}!`);
  };
  
  const argv = yargs(process.argv.splice(2))
    .command('ask', 'use inquirer to prompt for your name', () => {}, askName)
    .command('sing', 'a classic yargs command without prompting', () => {}, sing)
    .demandCommand(1, 1, 'choose a command: ask or sing')
    .strict()
    .help('h').argv;

  // const yargs = require('yargs');
  // await newScript({ argv: yargs, cwd: () => process.cwd() });
  
//   const argv = yargs
//   .command('lyr', 'Tells whether an year is leap year or not', {
//     year: {
//       description: 'the year to check for',
//       alias: 'y',
//       type: 'number'
//     }
//   })
//   .option('time', {
//     alias: 't',
//     description: 'Tell the present Time',
//     type: 'boolean'
//   })
//   .help()
//   .alias('help', 'h').argv;

// if (argv.time) {
//   console.log('The current time is: ', new Date().toLocaleTimeString());
// }

// if (argv._.includes('lyr')) {
//   const year = argv.year || new Date().getFullYear();
//   if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
//     console.log(`${year} is a Leap Year`);
//   } else {
//     console.log(`${year} is NOT a Leap Year`);
//   }
// }

// console.log(argv);

// const { hideBin } = require('yargs/helpers')

// yargs(hideBin(process.argv))
//   .command('serve [port]', 'start the server', (yargs) => {
//     return yargs
//       .positional('port', {
//         describe: 'port to bind on',
//         default: 5000
//       })
//   }, (argv) => {
//     if (argv.verbose) console.info(`start server on :${argv.port}`)
//     serve(argv.port)
//   })
//   .option('verbose', {
//     alias: 'v',
//     type: 'boolean',
//     description: 'Run with verbose logging'
//   })
//   .parse()

  // const { apiSetupFile, paths, startTimeJob } = options;
  
  // const defs = {
  //   createFiles: apiSetupFile.api.createFiles,
  //   ecosystemRecreate: apiSetupFile.ecosystem.recreate,
  //   packageJsonRecreate: apiSetupFile.package.recreate,
  //   pathBase: paths.baseAppPaths.folder_proj,
  //   appName: apiSetupFile.api.name.toUpperCase(),
  //   options,
  //   api: apiSetupFile.api,
  //   apiSetupFile,
  //   paths,
  //   startTimeJob
  // };
 
  // stampJob(defs, 'start');

  // if (defs.createFiles) {
  //   await startBuild(defs);
  //   stampJob(defs, 'center');
  //   if(apiSetupFile.api.modName==='subgraph-tools'){
  //     await createFiles(defs);
  //   }
  // }
  // await exec(`cd ${paths.baseAppPaths.folder_proj} && npm run gen`, 'localhost')
  // await execExtra(`cd ${paths.baseAppPaths.folder_proj} &&  node -r esm ./src/index.js environment=development generator=true`)
  // if(defs.api.modName==='subgraph-tools'){
    // try {
    //   await exec(`cd ${paths.baseAppPaths.folder_proj} && node -r esm ./src/index.js environment=localhostp generator`);
      
    // } catch (error) {
      
    // }

  // }
  // await exec(`cd ${paths.baseAppPaths.folder_proj} &&  node -r esm ./src/index.js environment=localhostp generator=true`);
  // stampJob(defs, 'end');
};

module.exports = { newJob };
