const path = require('path');
const clc = require('cli-color');
const { directoryExists, deleteDir, createDir, cleanDir, deleteFile } = require('./fs');
const sequence = require('promise-sequence/lib/sequence');
const { showCostTime } = require('@lzwme/dir-fast-copy/dist/utils');

let pathNodeModules, pathSrc, pathPublic, pathLogs, pathPackages, pathPackageLock, pathYarnLock, pathTables, pathProj, defStamp


const stampJob = (defs, position) => {
  const { nameProj, pathProj, startTimeJob } = defs;

  if (position === 'start') {
    console.log(clc.yellow('CLEAR -----------------  PROJS:   [X]'));
    console.log(clc.yellow('-----------------------  REPOS:   [ ]'));
    console.log(`Project     : ${nameProj}`);
    console.log(`Path        : ${pathProj}`);
    console.log('');
    console.log('cleaning, please await...');
  }

  if (position === 'end') {
    console.log('');
    console.log('job done in '+ showCostTime(startTimeJob));
    console.log(clc.yellow('-------------------------------------'));
    console.log('');
  }

  if (position === 'error') {
    console.log(clc.yellow('CLEAR -----------------  PROJS:   [X]'));
    console.log(clc.yellow('-----------------------  REPOS:   [ ]'));
    console.log(`No project: ${nameProj} found in`);
    console.log(`Path        : ${pathProj}`);
    console.log('');
    console.log('job done in '+ showCostTime(startTimeJob));
    console.log(clc.yellow('-------------------------------------'));
    console.log('');
  }

}

const isExistDir = async (pathProj, pathNodeModules, modType, opts) => {
  const listDir = []

  pathSrc = path.join(pathProj, 'src');
  pathPublic = path.join(pathProj, 'public');
  pathLogs = path.join(pathProj, 'logs');
  pathPackages = path.join(pathProj, 'packages');
  pathTables = path.join(pathProj, 'config/data-files/data-001');
  pathPackageLock = path.join(pathProj, 'package-lock.json');
  pathYarnLock = path.join(pathProj, 'yarn.lock');

  const isAppTablesExist = await directoryExists(pathTables);
  const isAppSrcExist = await directoryExists(pathSrc);
  const isAppPublicExist = await directoryExists(pathPublic);
  const isAppLogsExist = await directoryExists(pathLogs);
  const isAppPackagesExist = await directoryExists(pathPackages);
  const isPackageLockExist = await directoryExists(pathPackageLock);
  const isYarnLockExist = await directoryExists(pathYarnLock);
  const isNodeModulesExist = await directoryExists(pathNodeModules);

  if(modType === 'subgraph-tools'){
    listDir.push({ isExist: isAppTablesExist, path: pathTables });
    listDir.push({ isExist: isAppSrcExist, path: pathSrc });
  }

  /** 'supergraph-tools' */
  // listDir.push({ isExist: isAppPackagesExist, path: pathPackages });
  listDir.push({ isExist: isAppPublicExist, path: pathPublic });
  listDir.push({ isExist: isAppLogsExist, path: pathLogs });  
  listDir.push({ isExist: isPackageLockExist, path: pathPackageLock });
  listDir.push({ isExist: isYarnLockExist, path: pathYarnLock });

  if((!opts) || (opts && opts!=='fast')){
    listDir.push({ isExist: isNodeModulesExist, path: pathNodeModules });
  }  
  
  return listDir;
}


const clearStart = async (options) => {
  const { name, paths, name_module, opts, startTimeJob } = options;
  const isAppProjExist = await directoryExists(paths.baseAppPaths.folder_proj);
  pathNodeModules = paths.baseAppPaths.folder_node;
  pathProj = paths.baseAppPaths.folder_proj;
  defStamp = { nameProj: name, pathProj, startTimeJob };

  if (!isAppProjExist) {
    stampJob(defStamp, 'error');
    return false;
  } else {
    stampJob(defStamp, 'start');
    const listDir = await isExistDir(pathProj, pathNodeModules, name_module, opts);

    await sequence(
      listDir.map((job) => async () => {
        const { isExist, path } = job;
        if (isExist) {
          await deleteDir(path);
        }

      })
    );

    if(name_module==='supergraph-tools'){
      let pathGql = path.join(pathProj, 'src/schema/gql/subgraphs');
      await deleteDir(pathGql)
      pathGql = path.join(pathProj, 'src/schema/gql/supergraph');
      await deleteDir(pathGql)
      pathGql = path.join(pathProj, 'src/schema/gql/schema.graphql');
      await deleteFile(pathGql)
    }

    await createDir(pathPackages);
    stampJob(defStamp, 'end');
    return true;
  }

}

const clearJob = async (options) => {
  await clearStart(options);
};

module.exports = { clearJob };
