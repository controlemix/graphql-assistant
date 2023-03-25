const clc = require('cli-color');
const { sleep } = require('./constants');
const { exec } = require('./versionFsSync');
const { showCostTime } = require('@lzwme/dir-fast-copy/dist/utils');

const restartRepoProject = (options) =>  new Promise( async (resolve, _reject) => {
    const { name, paths, environment, startTimeJob } = options;
    const pathRepoApp = paths.repoAppPaths.folder_proj;
    const isAppRepoExist = true;
    if (!isAppRepoExist) {
      console.log('========================================================');
      console.log(`No project: ${name} found in`);
      console.log(`Path: ${pathRepoApp}`);
      console.log('========================================================');
      resolve(`No project: ${name} found in: ${pathRepoApp}`);
    } else {
      console.log(clc.green('RESTART ---------------  PROJS:   [ ]'));
      console.log(clc.green('-----------------------  REPOS:   [X]'));
      console.log(`Project     : ${name}`);
      console.log(`Path        : ${pathRepoApp}`);
      console.log('');
      console.log('stopping please await...');      
      await exec(`cd ${pathRepoApp} && pm2 delete ecosystem.yaml --env ${environment} --only ${name}-API`);
      console.log('starting please await...');   
      await exec(`cd ${pathRepoApp} && pm2 start ecosystem.yaml --env ${environment} --only ${name}-API --update-env`);            
      if(name.includes('GATEWAY')){ await sleep(7000) }
      console.log('');
      console.log('job done in '+ showCostTime(startTimeJob));
      console.log(clc.green('-------------------------------------'));      
      console.log('');
      resolve(`Project ${name} stopped!`);
    }
  });

module.exports = {
  restartRepoProject,
};
