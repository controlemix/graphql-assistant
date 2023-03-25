const path = require('path');
const { promises: fs } = require('fs');
const { runCommand } = require('./versionFsSync');

// if you want to have it automatically run based upon
// process.cwd()
const AUTO_RUN = Boolean(process.env.RI_AUTO_RUN);

/**
 * Creates a config object from environment variables which can then be
 * overriden if executing via its exported function (config as second arg)
 */
const getConfig = (config = {}) => ({
  // we want to use yarn by default but RI_USE_YARN=false will
  // use npm instead
  useYarn: process.env.RI_USE_YARN !== 'false',
  // should we handle yarn workspaces?  if this is true (default)
  // then we will stop recursing if a package.json has the "workspaces"
  // property and we will allow `yarn` to do its thing.
  yarnWorkspaces: process.env.RI_YARN_WORKSPACES !== 'false',
  // if truthy, will run extra checks to see if there is a package-lock.json
  // or yarn.lock file in a given directory and use that installer if so.
  detectLockFiles: process.env.RI_DETECT_LOCK_FILES !== 'false',
  // what kind of logging should be done on the spawned processes?
  // if this exists and it is not errors it will log everything
  // otherwise it will only log stderr and spawn errors
  log: process.env.RI_LOG || 'errors',
  // max depth to recurse?
  maxDepth: process.env.RI_MAX_DEPTH || Infinity,
  // do not install at the root directory?
  ignoreRoot: Boolean(process.env.RI_IGNORE_ROOT),
  // an array (or comma separated string for env var) of directories
  // to skip while recursing. if array, can pass functions which
  // return a boolean after receiving the dir path and fs.Dirent args
  // @see https://nodejs.org/api/fs.html#fs_class_fs_dirent
  skipDirectories: process.env.RI_SKIP_DIRS
    ? process.env.RI_SKIP_DIRS.split(',').map(str => str.trim())
    : undefined,
  // just run through and log the actions that would be taken?
  dry: Boolean(process.env.RI_DRY_RUN),
  ...config
});

function handleSpawnedProcess(dir, log, proc) {
  return new Promise((resolve, reject) => {
resolve();
  });
}

async function recurseDirectory(rootDir, config) {
  const {
    useYarn,
    yarnWorkspaces,
    detectLockFiles,
    maxDepth,
    ignoreRoot,
    dry,
    pathProj,
  } = config;

  const installPromises = [];

  function install(cmd, folder, relativeDir) {
    installPromises.push( runCommand(`cd ${pathProj} && npm install --force --legacy-peer-deps`, 'dev'));
  }


  async function getInstallCommand(folder) {
    let cmd = useYarn ? 'yarn' : 'npm';
    if (detectLockFiles) {
      const [hasYarnLock, hasPackageLock] = await Promise.all([
        fs
          .readFile(path.join(folder, 'yarn.lock'))
          .then(() => true)
          .catch(() => false),
        fs
          .readFile(path.join(folder, 'package-lock.json'))
          .then(() => true)
          .catch(() => false)
      ]);
      if (cmd === 'yarn' && !hasYarnLock && hasPackageLock) {
        cmd = 'npm';
      } else if (cmd === 'npm' && !hasPackageLock && hasYarnLock) {
        cmd = 'yarn';
      }
    }
    return cmd;
  }

  async function installRecursively(folder, depth = 0) {
    let pkg;

    if (folder !== rootDir || !ignoreRoot) {
      try {
        pkg = JSON.parse(await fs.readFile(path.join(folder, 'package.json')));
        const cmd = await getInstallCommand(folder);
        
        const relativeDir = folder;

        if (!dry) {
          install(cmd, folder, relativeDir);
        }
      } catch {
        // do nothing when error caught as it simply indicates package.json likely doesnt
        // exist.
      }
    }

    if (
      depth >= maxDepth ||
      (pkg && useYarn && yarnWorkspaces && pkg.workspaces)
    ) {
      // if we have reached maxDepth or if our package.json in the current directory
      // contains yarn workspaces then we use yarn for installing then this is the last
      // directory we will attempt to install.
      return;
    }

    const files = await fs.readdir(folder, { withFileTypes: true });

    return Promise.all(
      files.map(file => {
        const filePath = path.join(folder, file.name);
        return installRecursively(filePath, depth + 1)
      })
    );
  }

  await installRecursively(rootDir);
  await Promise.all(installPromises);
}

async function startRecursiveInstall(directories, _config) {
  const config = getConfig(_config);
  const promise = Array.isArray(directories)
    ? Promise.all(directories.map(rootDir => recurseDirectory(rootDir, config)))
    : recurseDirectory(directories, config);
  await promise;

}

if (AUTO_RUN) {
  startRecursiveInstall(process.cwd());
}

module.exports = {
    startRecursiveInstall
};