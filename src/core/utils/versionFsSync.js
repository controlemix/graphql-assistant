const fs = require('fs');
const {spawnSync} = require('child_process'); 
const path = require('path');
const util = require('util');
const { copyDir, createDir, directoryExists } = require('./fs');
const exec = util.promisify(require('child_process').exec);



const readFile = (path, opts = 'utf8') =>
  new Promise((resolve, reject) => require('fs').readFile(path, opts, (err, data) => (err ? reject(err) : resolve(data))));
const writeFile = async (path, data, opts = 'utf8') =>
  new Promise((resolve, reject) => require('fs').writeFile(path, data, opts, (err) => (err ? reject(err) : resolve(true))));

const createOperations = (command, NODE_ENV) => {
  let isShell = NODE_ENV !== 'test' ? true : false;
  require('child_process').spawnSync('gqlg  ' + command, { shell: isShell });
  return true;
};

const runPack = async (modSource, packDestination, NODE_ENV) =>
  new Promise((resolve, reject) => {
    let isShell = NODE_ENV !== 'test' ? true : false;
    let command = `pack --pack-destination=${packDestination} `;
    spawnSync(`cd ${modSource} && npm ${command}`, { shell: true })
    resolve(true);
  });

// const installMod = (modSource, pathInstall, NODE_ENV) =>
//   new Promise((resolve, reject) => {
//     let isShell = NODE_ENV !== 'test' ? true : false;
//     let command = `pack --pack-destination=${packDestination} `;
//     require('child_process').spawnSync(`cd ${pathInstall} && npm ${command}`, { shell: true }, (err) => resolve(true))
//   });


const runCommand = (command, NODE_ENV) =>
  new Promise((resolve, reject) => {
    spawnSync(`${command}`, { shell: true });
    resolve(true);
  });

const execExtra = (command) =>
  new Promise(async (resolve, reject) => {
    resolve(exec(`${command}`) );
  });
  


const copyNodeModule = async (modSource, modDestination, folder_node, name_module, NODE_ENV) => {
  return new Promise( async (resolve, reject) => {
  const src = modSource;
  const dist = modDestination;
  const isFolderNodeExist = await directoryExists(folder_node);
  const isFolderModExist = await directoryExists(modDestination);

  if(!isFolderNodeExist){
    await createDir(folder_node);    
  }

  if(!isFolderModExist){    
    await createDir(modDestination);
  }
  
  await copyDir(src, dist, true);
  resolve(true);
});
};



const removeOperationsFrag = (NODE_ENV) => {
  let command = ' -rf ./src/schema/gql/subgraphs/frags/operations/*';
  let isShell = NODE_ENV !== 'test' ? false : true;  
  require('child_process').spawnSync('rm  ' + command, { shell: isShell });

  command = ' -rf ./src/schema/gql/subgraphs/product/operations/*';
  require('child_process').spawnSync('rm  ' + command, { shell: isShell });

  command = ' -rf ./src/schema/gql/supergraph/operations/*';
  require('child_process').spawnSync('rm  ' + command, { shell: isShell });


  return true;
};

function checkFileExists(filepath) {
  return new Promise((resolve, reject) => {
    fs.access(filepath, fs.constants.F_OK, (error) => {
      resolve(!error);
    });
  });
}
const checkExists = (filepath) => 
   new Promise((resolve, reject) => {
    fs.access(filepath, fs.constants.F_OK, (error) => {
      resolve(!error);
    });
  });

module.exports.createOperations = createOperations;
module.exports.removeOperationsFrag = removeOperationsFrag;
module.exports.writeFile = writeFile;
module.exports.readFile = readFile;
module.exports.checkFileExists = checkFileExists;
module.exports.runPack = runPack;
module.exports.copyNodeModule = copyNodeModule;
module.exports.runCommand = runCommand;
module.exports.checkExists = checkExists;
module.exports.exec = exec;
module.exports.execExtra = execExtra;
