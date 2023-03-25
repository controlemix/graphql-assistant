const path = require('path');
const clc = require('cli-color');
const unzip = require('unzip-stream');
const fs = require('fs')
const { showCostTime } = require('@lzwme/dir-fast-copy/dist/utils');

const stampJob = (defs, position) => {
  const { nameProj, pathProj, startTimeJob } = defs;

  if (position === 'start') {
    console.log(clc.yellow('EXTRACT -----------------  PROJS:   [X]'));
    console.log(clc.yellow('-------------------------  REPOS:   [ ]'));
    console.log(`Project     : ${nameProj}`);
    console.log(`Path        : ${pathProj}`);
    console.log('');
    
  }

  if (position === 'end') {
    console.log('');
    console.log('job done in ' + showCostTime(startTimeJob));
    console.log(clc.yellow('-------------------------------------'));
    console.log('');
  }

  if (position === 'error') {
    console.log(clc.yellow('CLEAR -----------------  PROJS:   [X]'));
    console.log(clc.yellow('-----------------------  REPOS:   [ ]'));
    console.log(`No project: ${nameProj} found in`);
    console.log(`Path        : ${pathProj}`);
    console.log('');
    console.log('job done in ' + showCostTime(startTimeJob));
    console.log(clc.yellow('-------------------------------------'));
    console.log('');
  }
}

const extractJob = (options) =>
  new Promise(async (resolve, _reject) => {
    const { startTimeJob } = options
    const nmSub = fs.createReadStream(path.join(__dirname, '../../../../../', 'CACHE/SUBSCHEMA/nm-sub.zip'))
    const nmSuper = fs.createReadStream(path.join(__dirname, '../../../../../', 'CACHE/SUPERSCHEMA/nm-super.zip'))
    const keys = Object.keys(options);

    keys.forEach(async (key, index) => {
      if (key !== 'startTimeJob') {
        
        const { paths, name, name_module } = options[key]
        const pathProj = paths.baseAppPaths.folder_proj;
        const defStamp = { nameProj: name, pathProj, startTimeJob }
        stampJob(defStamp, 'start');
        
        if (name_module.includes('subgraph-tools')) {
          nmSub.pipe(unzip.Extract({ path: pathProj })).on('close', () => {
            if(keys.length-2 === index) {
              resolve()
            }
          });
        } else {
            
          nmSuper.pipe(unzip.Extract({ path: pathProj })).on('close', () => {
            if(keys.length-2 === index) {
              resolve()
            }
          });
        }
        
      }
    });
    console.log('');
    console.log('unzip, please await...');
    console.log('');
  });


module.exports = {
  extractJob,
};
