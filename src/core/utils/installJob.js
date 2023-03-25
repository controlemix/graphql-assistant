const path = require('path');
const clc = require('cli-color');
const { readdirSync } = require('fs');
const { startRecursiveInstall } = require('./installRecursive');
const { fileExists, deleteFile, copyDir } = require('./fs');
const { exec } = require('./versionFsSync');
const { fastCopy } = require('@lzwme/dir-fast-copy');
const { formatFileSize, showCostTime, getAllFiles,  } = require('@lzwme/dir-fast-copy/dist/utils');

const getDirectories = (source, folder_proj) =>
readdirSync(source, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory() && dirent.name !== folder_proj)
  .map(dirent => dirent.name)

function progress(stats, steep) {
  const {totalFile, totalFileSize, totalDir, totalFileNewSize} = stats;
   if(steep === 'start') {
    console.log(clc.bgBlackBright(clc.white(`Folder Cache:`)));
    console.log(clc.bgBlackBright(clc.white(`Total Files       : ${totalFile}`)));
    console.log(clc.bgBlackBright(clc.white(`Total Directories : ${totalDir}`)));
    console.log('');
  }

  if(steep === 'end') {
    console.log('');
    console.log(clc.bgBlackBright(clc.white(`Work Done:`)));
    console.log(clc.bgBlackBright(clc.white(`Total Size Cache   : ${formatFileSize(totalFileSize)}`)));
    console.log(clc.bgBlackBright(clc.white(`Total Size Copied  : ${formatFileSize(totalFileNewSize)}`)));
  }
}

const installJob =  (options) => 
   new Promise( async (resolve, _reject) => {
    const { name, paths, folder_proj, name_module, cache, opts, startTimeJob } = options;
    const pathProj = paths.baseAppPaths.folder_proj;
    const rootProjPath = paths.rootProjPath;
    const isAppProjExist =  true;
    let mode ='full'
    if((!opts) || (opts && opts==='fast')){
      mode ='fast'
    }  
    
   const dirsIgnore = getDirectories(rootProjPath, folder_proj);
   let strDirs = ''
   dirsIgnore.forEach(dir => {
      strDirs += `${dir},`
    });
    strDirs = strDirs.slice(0, -1);
    
   const config = {
    useYarn: false,
    yarnWorkspaces: false,
    detectLockFiles: true,
    log: true,
    maxDepth: 1,
    ignoreRoot: false,
    skipDirectories: dirsIgnore,
    pathProj,
    rootProjPath,
    dry: false
  };
    
    process.env.RI_AUTO_RUN = false;
    process.env.RI_USE_YARN = false;
    process.env.RI_YARN_WORKSPACES = false;
    process.env.RI_DETECT_LOCK_FILES = true;
    process.env.RI_LOG = true;
    process.env.RI_MAX_DEPTH = 1;
    process.env.RI_IGNORE_ROOT = false;
    process.env.RI_SKIP_DIRS = dirsIgnore;
    process.env.RI_DRY = false;



    if (!isAppProjExist) {
      console.log(clc.yellow('========================================================'));
      console.log(`No project: ${name} found in`);
      console.log(`Path: ${pathProj}`);
      console.log('========================================================');
      resolve(false);
    } else {
      const pathProjPackageLockJson = path.join(pathProj, 'package-lock.json');
      const isExistPackageLockJson = await fileExists(pathProjPackageLockJson);

      const pathProjYarnLockJson = path.join(pathProj, 'yarn.lock');
      const isExistYarnLockJson = await fileExists(pathProjYarnLockJson);

      const isExistNode = await fileExists(paths.baseAppPaths.folder_node);



      if (isExistYarnLockJson) {
        await deleteFile(pathProjYarnLockJson);
      }

      if(isExistPackageLockJson) {
        await deleteFile(pathProjPackageLockJson);
      }
      console.log(clc.yellow('INSTALL ---------------  PROJS:   [X]'));
      console.log(clc.yellow('-----------------------  REPOS:   [ ]'));      
      console.log(`Project     : ${name}`);
      console.log(`Path        : ${pathProj}`);   
      console.log('');   

      if ((isExistNode && !cache) || (isExistNode && mode === 'full')) {
        console.log(clc.redBright('removing install, please await...')); 
        await exec(`npx rimraf ${paths.baseAppPaths.folder_node}`);
        console.log(clc.greenBright('complete!'));
        console.log('');
      }        
      
      let nodeBaseCachePath = '';
      if(name_module.includes('subgraph-tools')){
        nodeBaseCachePath = path.join(__dirname, '../../../../../', 'CACHE/SUBSCHEMA/');
      }else{
        nodeBaseCachePath = path.join(__dirname, '../../../../../', 'CACHE/SUPERSCHEMA/');
      }

      const nodeCachePath = path.join(nodeBaseCachePath, 'node_modules')
      const isNodeCache = await fileExists(nodeCachePath);
      let isInstall = false;
      if ( (isNodeCache && cache===true && mode === 'fast') )  { 


        progress(getAllFiles(nodeCachePath,paths.baseAppPaths.folder_node ), 'start');
        console.log(clc.greenBright('copy install from cache please await...')); 
        const config = {
          src: nodeCachePath,
          dest: paths.baseAppPaths.folder_node,
          slient: true,
          enableThreads: true,
          isSkipSameFile: true,
          cpDuringStats: true,
          onEnd: stats => progress(stats, 'end'),
        };
        await fastCopy(config)
      } else if(mode === 'full') {
        console.log(clc.redBright('installing full please await...')); 
        await startRecursiveInstall(rootProjPath, config);
        console.log(clc.greenBright('complete!')); 
        console.log('');
        isInstall = true;
      }

      const isExist = await fileExists(paths.baseAppPaths.folder_node);

      if((isExist && !isNodeCache) || (isExist && isInstall)){

        progress(getAllFiles(paths.baseAppPaths.folder_node, nodeCachePath), 'start');
        console.log(clc.greenBright('copy install for cache please await...')); 
        const config = {
          src: paths.baseAppPaths.folder_node,
          dest: nodeCachePath,
          slient: true,
          enableThreads: true,
          isSkipSameFile: false,
          cpDuringStats: true,
          onEnd: stats => progress(stats, 'end'),
        };
        await fastCopy(config)
      }
      console.log('');
      console.log('job done in '+ showCostTime(startTimeJob));
      console.log(clc.yellow('-------------------------------------'));
      console.log('');
      resolve(`Project ${name} installed!`);
    }
  });


module.exports = {
  installJob,
};
