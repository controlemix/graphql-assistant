const clc = require('cli-color');
const { sleep } = require('./constants');
const { exec } = require('./versionFsSync');
const { showCostTime } = require('@lzwme/dir-fast-copy/dist/utils');

const restartProject = (options) =>  new Promise( async (resolve, _reject) => {
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
      console.log(clc.blueBright('RESTART JOB ----------------------------'));
      console.log(clc.blueBright('-------------------------------------'));
      console.log(`Project     : ${name}`);
      console.log(`Path        : ${pathProj}`);
      console.log('');
      console.log('stopping please await...');      
      await exec(`cd ${pathProj} && pm2 delete ecosystem.yaml --env ${environment} --only ${name}-API`);
      await sleep(500)
      console.log('starting please await...');   
      await exec(`cd ${pathProj} && pm2 start ecosystem.yaml --env ${environment} --only ${name}-API --update-env`);            
      if(name.includes('GATEWAY')){ await sleep(3000) }
      console.log('');
      console.log('job done in '+ showCostTime(startTimeJob));
      console.log(clc.blueBright('-------------------------------------'));
      console.log('');
      resolve(`Project ${name} stopped!`);
    }
  });

module.exports = {
  restartProject,
};
