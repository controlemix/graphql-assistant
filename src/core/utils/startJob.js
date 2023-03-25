const clc = require('cli-color');
const { sleep } = require('./constants');
const { exec } = require('./versionFsSync');
const { showCostTime } = require('@lzwme/dir-fast-copy/dist/utils');

const startJob = (options) => new Promise(async (resolve, _reject) => {
    const { name, paths, environment, startTimeJob } = options;
    const pathProj = paths.baseAppPaths.folder_proj;
    const isAppProjExist = true;
    if (!isAppProjExist) {
      console.log('========================================================');
      console.log(`No project: ${name} found in`);
      console.log(`Path: ${pathProj}`);
      console.log('========================================================');      
      resolve(`No project: ${name} found in: ${pathProj}`);
    } else {

      console.log(clc.green('START JOB ---------------------------'));      
      console.log(clc.green('-------------------------------------'));
      console.log(`Project     : ${name}`);
      console.log(`Path        : ${pathProj}`);
      console.log('');
      console.log('starting please await...');
      if(name.includes('GATEWAY')){ await sleep(3000) }      
      await exec(`cd ${pathProj} && pm2 start ecosystem.yaml --env ${environment} --only ${name}-API --update-env`);
      console.log('job done in '+ showCostTime(startTimeJob));
      console.log(clc.green('-------------------------------------'));
      console.log('');
      resolve(`Project ${name} started!`);
    }
  });

module.exports = {
  startJob,
};
