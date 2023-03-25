const clc = require('cli-color');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { showCostTime } = require('@lzwme/dir-fast-copy/dist/utils');
const path = require('path');

function runProject(options) { return  new Promise( async (resolve, _reject) => {
    const { name, paths, environment, name_module, startTimeJob } = options;
    const pathProj = paths.baseAppPaths.folder_proj;
    const isAppProjExist = true;
    if (!isAppProjExist) {
      console.log('========================================================');
      console.log(`No project: ${name} found in`);
      console.log(`Path: ${pathProj}`);
      console.log('========================================================');
      resolve(`No project: ${name} found in: ${pathProj}`);
    } else {
      console.log(clc.blueBright('RUN -------------------  PROJS:   [X]'));
      console.log(clc.blueBright('-----------------------  REPOS:   [ ]'));      
      console.log(`Project     : ${name}`);
      console.log(`Path        : ${pathProj}`);
      console.log('');

      
      console.log('generating operations gql, working please await...');     
      try {        
        await exec(`cd ${pathProj} && node -r esm ./src/index.js environment=${environment} generator=true`);        
      } catch (error) {
        console.log('');        
      }
      
try {
 
    await exec(`cd ${pathProj} && node -r esm ./src/index.js environment=${environment} generator=true`);
    
 
} catch (error) {
  
  console.log('');
}   

if(name_module === 'subgraph-tools'){
  await exec(`cd ${pathProj} && npx gqlg --schemaFilePath ${path.join(pathProj, '/src/schema/gql/', 'typeDefs.graphql')} --destDirPath ${path.join(pathProj, '/src/schema/operations')}`);          
}
      
      
      console.log('job done in '+ showCostTime(startTimeJob));
      console.log(clc.blueBright('-------------------------------------'));
      console.log('');
      resolve(`Project ${name} prepared!`);
    }
  });
}

module.exports = {
  runProject,
};
