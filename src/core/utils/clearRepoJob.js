const path = require('path');
const clc = require('cli-color');
const { fileExists, deleteFile, directoryExists, deleteDir } = require('./fs');
const { exec } = require('./versionFsSync');
const { showCostTime } = require('@lzwme/dir-fast-copy/dist/utils');

const clearRepo =  (options) => 
   new Promise( async (resolve, _reject) => {
    const { name, paths, opts, startTimeJob } = options;
    let pathPackageLock, pathYarnLock, isExist, folderNodeName;
    const pathProj = paths.repoAppPaths.folder_proj;
    const isAppProjExist =  true;    
    folderNodeName = paths.repoAppPaths.folder_node;
    console.log(clc.yellow('CLEAR -----------------  PROJS:   [ ]'));
    console.log(clc.yellow('-----------------------  REPOS:   [X]'));
    console.log(`Project     : ${name}`);
    console.log(`Path        : ${pathProj}`);   
    console.log('');   
    console.log('Cleaner please await...');   
    
    const pathSrc = path.join(pathProj, 'src');
    isExist = await directoryExists(pathSrc);
    if (isExist) {
      await deleteDir(pathSrc);
    }
    const pathConfig = path.join(pathProj, 'config');
    isExist = await directoryExists(pathConfig);
    if (isExist) {
      await deleteDir(pathConfig);
    }
    const pathPackages = path.join(pathProj, 'packages');
    isExist = await directoryExists(pathPackages);
    if (isExist) {
      await deleteDir(pathPackages);
    }
    const pathPublic = path.join(pathProj, 'public');
    isExist = await directoryExists(pathPublic);
    if (isExist) {
      await deleteDir(pathPublic);
    }
    const pathLogs = path.join(pathProj, 'logs');
    isExist = await directoryExists(pathLogs);
    if (isExist) {
      await deleteDir(pathLogs);
    }

    if (!isAppProjExist) {
      console.log(clc.yellow('========================================================'));
      console.log(`No project: ${name} found in`);
      console.log(`Path: ${pathProj}`);
      console.log('========================================================');
      resolve(false);
    } else {

      pathPackageLock = path.join(pathProj, 'package-lock.json');
      isExist = await fileExists(pathPackageLock);
      if(isExist) {
        await deleteFile(pathPackageLock);
      }

      pathYarnLock = path.join(pathProj, 'yarn.lock');
      isExist = await fileExists(pathYarnLock);
      if (isExist) {
        await deleteFile(pathYarnLock);
      }

      isExist = await fileExists(folderNodeName);
      
      if((isExist && !opts) || (isExist && opts && opts!=='fast')){
        await exec(`npx rimraf ${folderNodeName}`)
      }  
        
      console.log('');
      console.log('job done in '+ showCostTime(startTimeJob));
      console.log(clc.yellow('-------------------------------------'));
      console.log('');
      resolve(`Project ${name} clean!`);
    }
  });


module.exports = {
  clearRepo,
};
