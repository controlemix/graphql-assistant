const path = require('path');

function getCorePaths(options) {
  const { folder_proj, folder_module, name_module, version_module, folder_repo } = options;
  const folderRepo = folder_repo ? folder_repo : folder_proj;
  const baseModPath = path.join(__dirname, '../../../../PACKS/', folder_module, '/');
  const baseAppPath = path.join(__dirname, '../../../../PROJS/', folder_proj, '/');
  const rootProjPath = path.join(__dirname, '../../../../PROJS/');
  const rootRepoPath = path.join(__dirname, '../../../../REPOS/');
  const repoAppPath = path.join(__dirname, '../../../../REPOS/', folderRepo, '/');

  const baseModPaths = {
    folder_module: baseModPath,
    package_json: path.join(baseModPath, 'package.json'),
    module_file: path.join(baseModPath, `${name_module}-${version_module}.tgz`),
  };

  const baseAppPaths = {
    folder_proj: baseAppPath,
    package_json: path.join(baseAppPath, 'package.json'),
    folder_pack: path.join(baseAppPath, 'packages', '/'),
    folder_module: path.join(baseAppPath, 'node_modules', '/', `${name_module}`, '/'),
    folder_node: path.join(baseAppPath, 'node_modules', '/'),
    api_setup: path.join(baseAppPath, 'config', 'api-setup.yaml'),
    ecosystem: path.join(baseAppPath, 'ecosystem.yaml'),
  };
  const repoAppPaths = {
    folder_proj: repoAppPath,
    package_json: path.join(repoAppPath, 'package.json'),
    folder_pack: path.join(repoAppPath, 'packages', '/'),
    folder_module: path.join(repoAppPath, 'node_modules', '/', `${name_module}`, '/'),
    folder_node: path.join(repoAppPath, 'node_modules', '/'),
    api_setup: path.join(repoAppPath, 'config', 'api-setup.yaml'),
    ecosystem: path.join(repoAppPath, 'ecosystem.yaml'),
  };

  const paths = { baseModPaths, baseAppPaths, repoAppPaths, rootProjPath, rootRepoPath };

  return { paths };
}
function getApiSetup(folder_proj) {
  const baseAppPath = path.join(__dirname, '../../../../PROJS/', folder_proj, '/');
  const baseAppPaths = {
    api_setup: path.join(baseAppPath, 'config', 'api-setup.yaml'),
    folder_proj: baseAppPath,
  };
  const pathsApiSetup = {  baseAppPaths };
  return { pathsApiSetup };
}

module.exports = { getCorePaths, getApiSetup };
