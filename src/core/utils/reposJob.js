const path = require('path');
const clc = require('cli-color');
const { exec } = require('./versionFsSync');
const { copyDir, deleteFile, directoryExists, copyFile, fileExists } = require('./fs');
const { showCostTime } = require('@lzwme/dir-fast-copy/dist/utils');

const reposProject = (options) => new Promise(async (resolve, _reject) => {
  const { name, paths, opts, startTimeJob } = options;
  const pathProj = paths.baseAppPaths.folder_proj;
  const pathRepo = paths.repoAppPaths.folder_proj;
  const isAppProjExist = await directoryExists(pathProj);
  const isRepoProjExist = await directoryExists(pathRepo);

  if (!isAppProjExist) {
    console.log('========================================================');
    console.log(`No project: ${name} found in`);
    console.log(`Path: ${pathProj}`);
    console.log('========================================================');
    resolve(`No project: ${name} found in: ${pathProj}`);
  }

  if (!isRepoProjExist) {
    console.log('========================================================');
    console.log(`No project: ${name} found in`);
    console.log(`Path: ${pathRepo}`);
    console.log('========================================================');
    resolve(`No project: ${name} found in: ${pathRepo}`);
  }

  if (isAppProjExist && isRepoProjExist) {
    console.log(clc.blueBright('UPDATE ----------------  PROJS:   [ ]'));
    console.log(clc.blueBright('-----------------------  REPOS:   [X]'));         
    console.log(`Project     : ${name}`);
    console.log(`Path from   : ${pathProj}`);
    console.log(`Path to     : ${pathRepo}`);
    console.log('');
    console.log('working please await...');
    await updateRepo(options);
    console.log('');
    console.log('job done in '+ showCostTime(startTimeJob));
    console.log(clc.blueBright('-------------------------------------'));
    console.log('');
    resolve(`Repository  ${name} updated!`);
  }
});

const updateRepo = (options) => new Promise(async (resolve, _reject) => {
  const { paths, opts } = options;
  const baseFrom = paths.baseAppPaths.folder_proj
  const baseTo = paths.repoAppPaths.folder_proj
  const pathSrcFrom = path.join(paths.baseAppPaths.folder_proj, 'src');
  const pathSrcTo = path.join(paths.repoAppPaths.folder_proj, 'src');
  const pathConfigFrom = path.join(paths.baseAppPaths.folder_proj, 'config');
  const pathConfigTo = path.join(paths.repoAppPaths.folder_proj, 'config');
  const pathPackagesFrom = path.join(paths.baseAppPaths.folder_proj, 'packages');
  const pathPackagesTo = path.join(paths.repoAppPaths.folder_proj, 'packages');
  const pathPublicFrom = path.join(paths.baseAppPaths.folder_proj, 'public');
  const pathPublicTo = path.join(paths.repoAppPaths.folder_proj, 'public');
  const pathLogsFrom = path.join(paths.baseAppPaths.folder_proj, 'logs');
  const pathLogsTo = path.join(paths.repoAppPaths.folder_proj, 'logs');
  const pathModFrom = paths.baseModPaths.folder_module;
  const pathModTo = paths.repoAppPaths.folder_module;
  const pathNodeFrom = paths.baseAppPaths.folder_node;
  const pathNodeTo = paths.repoAppPaths.folder_node;
  const isModFromExist = await directoryExists(pathModFrom);
  const isModToExist = await directoryExists(pathModTo);
  const isNodeFromExist = await directoryExists(pathNodeFrom);
  const isNodeToExist = await directoryExists(pathNodeTo);
  const isLogsFromExist = await directoryExists(pathLogsFrom);
  const isLogsToExist = await directoryExists(pathLogsTo);
  const isPublicFromExist = await directoryExists(pathPublicFrom);
  const isPublicToExist = await directoryExists(pathPublicTo);
  const isPackagesFromExist = await directoryExists(pathPackagesFrom);
  const isPackagesToExist = await directoryExists(pathPackagesTo);
  const isSrcFromExist = await directoryExists(pathSrcFrom);
  const isSrcToExist = await directoryExists(pathSrcTo);
  const isConfigFromExist = await directoryExists(pathConfigFrom);
  const isConfigToExist = await directoryExists(pathConfigTo);

  if((isNodeToExist && isNodeFromExist && !opts) || (isNodeToExist && isNodeFromExist && opts && opts!=='fast')){
    await exec(`npx rimraf ${pathNodeTo}`)
  }  

  if (isModToExist && isModFromExist) { await exec(`npx rimraf ${pathModTo}`)}
  if (isLogsToExist && isLogsFromExist) { await exec(`npx rimraf ${pathLogsTo}`)}
  if (isPublicToExist && isPublicFromExist) { await exec(`npx rimraf ${pathPublicTo}`)}
  if (isPackagesToExist && isPackagesFromExist) { await exec(`npx rimraf ${pathPackagesTo}`)}
  if (isConfigToExist && isConfigFromExist) { await exec(`npx rimraf ${pathConfigTo}`)}
  if (isSrcToExist && isSrcFromExist) { await exec(`npx rimraf ${pathSrcTo}`)}
  if (isSrcFromExist) { await copyDir(pathSrcFrom, pathSrcTo, true)}
  if (isConfigFromExist) { await copyDir(pathConfigFrom, pathConfigTo, true)}
  if (isPackagesFromExist) { await copyDir(pathPackagesFrom, pathPackagesTo, true)}
  if (isPublicFromExist) { await copyDir(pathPublicFrom, pathPublicTo, true) }
  if (isLogsFromExist) { await copyDir(pathLogsFrom, pathLogsTo, true) }



  if((isNodeFromExist && !opts) || (isNodeFromExist && opts && opts!=='fast')){
    await copyDir(pathNodeFrom, pathNodeTo, true)
  }  
  
  if (isModFromExist && isNodeToExist) { await copyDir(pathModFrom, pathModTo, true) }

  const isPkgJsonToExist = await fileExists(`${baseTo}package.json`);
  const isEcosystemToExist = await fileExists(`${baseTo}ecosystem.yaml`);
  const isPkgLockToExist = await fileExists(`${baseTo}package-lock.json`);
  const isYarnLockToExist = await fileExists(`${baseTo}yarn.lock`);

  if(isPkgLockToExist){ await deleteFile(`${baseTo}package-lock.json`)}
  if(isYarnLockToExist){ await deleteFile(`${baseTo}yarn.lock`)}
  if(isPkgJsonToExist){ await deleteFile(`${baseTo}package.json`)}
  if(isEcosystemToExist){ await deleteFile(`${baseTo}ecosystem.yaml`)}
  
  await copyFile(`${baseFrom}ecosystem.yaml`, `${baseTo}ecosystem.yaml`);
  await copyFile(`${baseFrom}package.json`, `${baseTo}package.json`);

  resolve('done');
});



module.exports = { reposProject};
