const { runPack, writeFile, copyNodeModule, exec } = require('./versionFsSync');
const path = require('path');
const clc = require('cli-color');
const semver = require('semver');
const { fastCopy } = require('@lzwme/dir-fast-copy');
const { formatFileSize, showCostTime, getAllFiles,  } = require('@lzwme/dir-fast-copy/dist/utils');
const { fileExists } = require('./fs');

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

const updateJob =  (options) => 
  new Promise( async (resolve, reject) => {

    const {
      folder_module,
      name_module,
      override_copy,
      override_version_adjust,
      active_proj,
      project,
      paths,
      modcopy_proj,
      veradjust_proj,
      startTimeJob
    } = options;
    let dependencies = {};

    let nodeBaseCachePath = '';
    let nodeCachePath = '';

    if(name_module.includes('subgraph-tools')){
      nodeBaseCachePath = path.join(__dirname, '../../../../../', 'CACHE/SUBSCHEMA/');
      nodeCachePath = path.join(nodeBaseCachePath, 'node_modules/subgraph-tools');
    }else{
      nodeBaseCachePath = path.join(__dirname, '../../../../../', 'CACHE/SUPERSCHEMA/');
      nodeCachePath = path.join(nodeBaseCachePath, 'node_modules/supergraph-tools');
    }

    const isNodeCache = await fileExists(nodeCachePath);

    if (active_proj) {
      let pathProj = paths.baseAppPaths.folder_proj;
      let isAppProjExist = true;
   

      if (!isAppProjExist) {
        console.log('');
        console.log('========================================================');
        console.log(`No project: ${project.name} found in folder path: ${pathProj}`);
        console.log('========================================================');
        console.log('');
      } else {

        console.log(clc.cyan('UPDATE ----------------  PROJS:   [X]'));
        console.log(clc.cyan('-----------------------  REPOS:   [ ]'));
        console.log(`Project     : ${project.name}`);
        console.log(`Path        : ${pathProj}`);
        console.log('');
        
        dependencies = {
          apps: [
            {
              name: project.name,
              active: true,
              folder_module,
              name_module,
              folder_proj: project.folder_proj,
              folder_pack: 'packages',
              module_copy: modcopy_proj,
              version_adjust: veradjust_proj,
              override_copy,
              override_version_adjust,
              paths,
            },
          ],
        };
        const {  active } = dependencies.apps[0];
        const isModPackExist = true;
        if (active) {
          const currentPackModVersion = require(paths.baseModPaths.package_json).version;

          dependencies.apps.forEach( async (dependency) => {
            if (dependency.name !== 'env' && dependency.active) {

              const module_copy = override_copy ? true : dependency.module_copy;
              const version_adjust = override_version_adjust ? true : dependency.version_adjust;

              if (isModPackExist) {
                let type = 'patch';
                let packageLoad = require(paths.baseModPaths.package_json);
                let currentVersion = packageLoad.version;
                let newVersion = currentVersion;
                let versionModule = currentVersion;
                let nextVersion = currentVersion;

                if (version_adjust) {
                  versionModule = currentPackModVersion;
                  nextVersion = semver.inc(versionModule, type);
                }

                // if (nextVersion !== versionModule) {
                //   newVersion = nextVersion;
                //   packageLoad.version = nextVersion;
                //   await writeFile(paths.baseModPaths.package_json, JSON.stringify(packageLoad, null, 2));
                // }

                await runPack(paths.baseModPaths.folder_module, paths.baseAppPaths.folder_pack, 'development');
                const filePack = `file:packages/${dependency.name_module}-${newVersion}.tgz`;

                if (isModPackExist) {
                  let packageAppLoad = require(paths.baseAppPaths.package_json);
                  let modBefore = packageAppLoad.dependencies[dependency.name_module];
                  let modAfter = filePack;
                  packageAppLoad.dependencies[dependency.name_module] = modAfter;

                  if (module_copy) {
                    await  copyNodeModule(
                      paths.baseModPaths.folder_module,
                      paths.baseAppPaths.folder_module,
                      paths.baseAppPaths.folder_node,
                      dependency.name_module,
                      'development'
                    );
                    if(isNodeCache){
                      console.log(clc.greenBright('copy module for cache please await...')); 
                      console.log('');
                      progress(getAllFiles(paths.baseAppPaths.folder_module, nodeCachePath ), 'start');
                      const config = {
                        src: paths.baseAppPaths.folder_module,
                        dest: nodeCachePath,
                        slient: true,
                        enableThreads: true,
                        isSkipSameFile: false,
                        cpDuringStats: true,
                        onEnd: stats => progress(stats, 'end'),
                      };
                      await fastCopy(config)
                    }
                    await writeFile(paths.baseAppPaths.package_json, JSON.stringify(packageAppLoad, null, 2));
                  }
                  
                  console.log(`Ver. Before : ${versionModule}`);
                  console.log(`Ver. After  : ${newVersion}`);
                  console.log(`File Before : ${modBefore}`);
                  console.log(`File After  : ${modAfter}`);
                  console.log('');
                  console.log('job done in '+ showCostTime(startTimeJob)); 
                  console.log(clc.cyan('-------------------------------------'));
                  console.log('');
                  resolve(`Project ${dependency.name} module and files updated`);
                }
              }
            }
          });
        } else {
          resolve('Process not active');
        }
      }
    }
  });

module.exports = {
  updateJob,
};
