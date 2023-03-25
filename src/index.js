const yaml = require('yamljs');
const path = require('path');
const sequence = require('promise-sequence/lib/sequence');
const { getCorePaths, getApiSetup } = require('./core/paths');
const { installJob } = require('./core/utils/installJob');
const { updateJob } = require('./core/utils/updateJob');
const { restartProject } = require('./core/utils/restartJob');
const { buildJob } = require('./core/utils/buildJob');
const { startJob } = require('./core/utils/startJob');
const { stopJob } = require('./core/utils/stopJob');
const { runProject } = require('./core/utils/runJob');
const { reposProject } = require('./core/utils/reposJob');
const { restartRepoProject } = require('./core/utils/restrepoJob');
const { clearJob } = require('./core/utils/clearJob');
const { clearRepo } = require('./core/utils/clearRepoJob');
const { exec } = require('./core/utils/versionFsSync');
const { fileExists } = require('./core/utils/fs');
const { showCostTime } = require('@lzwme/dir-fast-copy/dist/utils');
const { extractJob } = require('./core/utils/extractJob');
// const { newJob } = require('./core/utils/newJob');

function compare(a, b) {
  if (a.ord < b.ord) {
    return -1;
  }
  if (a.ord > b.ord) {
    return 1;
  }
  return 0;
}

const getArgs =  (projectSetup, action, environment, cache) => {
  const { pathsApiSetup } =  getApiSetup(projectSetup.folder_proj);
  const apiSetupFile =  yaml.load(pathsApiSetup.baseAppPaths.api_setup);
  const { modName, packName, modVer, modCopy } = apiSetupFile.api;

  const override_copy = false;
  const override_version_adjust = false;
  const name_module = modName;
  const folder_module = packName;
  const version_module = modVer;
  const folder_proj = projectSetup.folder_proj;
  const folder_repo = projectSetup.folder_repo;
  const active_proj = projectSetup.active_proj;
  const active_repo = projectSetup.active_repo;
  const modcopy_proj = modCopy;
  const name = projectSetup.name;
  const { paths } = getCorePaths({ folder_proj, folder_module, name_module, version_module, folder_repo });
  const args = {
    name,
    project: projectSetup,
    actions: action,
    target: projectSetup.name,
    cache,
    environment,
    paths,
    override_copy,
    override_version_adjust,
    active_proj,
    active_repo,
    folder_module,
    version_module,
    folder_proj,
    folderRepo: folder_repo,
    modcopy_proj,
    modcopy_repo: modCopy,
    name_module,
    veradjust_proj: false,
    veradjust_repo: false,
    apiSetupFile,
  };

  return {args};
};

const clearCache = async (cache) => {
  if (!cache) {
    const nodeBaseCacheSubPath = path.join(__dirname, '../../../', 'CACHE/SUBSCHEMA/node_modules');
    const nodeBaseCacheSuperPath = path.join(__dirname, '../../../', 'CACHE/SUPERSCHEMA/node_modules');
    const isSubNodeCache = await fileExists(nodeBaseCacheSubPath);
    const isSuperNodeCache = await fileExists(nodeBaseCacheSuperPath);
    if (isSubNodeCache) {
      await exec(`npx rimraf ${nodeBaseCacheSubPath}`)
    }
    if (isSuperNodeCache) {
      await exec(`npx rimraf ${nodeBaseCacheSuperPath}`)
    }
  }
}

const extractArgs = async () => {
  const argTarget = process.argv.find((env) => env?.includes('target'));
  const argActions = process.argv.find((env) => env?.includes('actions'));
  const argOptions = process.argv.find((env) => env?.includes('options'));
  const argEnvironment = process.argv.find((env) => env?.includes('env'));
  const environment = argEnvironment ? argEnvironment.split('=')[1] : undefined;
  const argCache = process.argv.find((env) => env?.includes('persist'));

  let cache = argCache ? argCache.split('=')[1] : false;
  if(cache==='true') { cache = true }

  const target = argTarget ? argTarget.split('=')[1] : undefined;
  
  const targets = argTarget?.includes(',') ? argTarget.replace('target=','').split(',')  : undefined;

  const actions = argActions ? argActions.split('=')[1] : undefined;
  const options = argOptions ? argOptions.split('=')[1] : undefined;
  const setupFile = yaml.load(`./config/setup.yaml`);
  const { projects } = setupFile;
  const project = target?.includes('all') ? 'all' : projects.find((project) => project.name === target);
  let proj
  validateArgs(environment, actions, project, target, targets);

  await clearCache(cache)
  const listProjects = [];

  if (target?.includes('all') && targets===undefined) {
    projects.forEach(async (projectItem) => {
      if (projectItem.name !== 'env' && projectItem.active_proj) {
        listProjects.push(projectItem);
      }
    });
  } 
  
  else if(targets===undefined){
    proj = projects.find((project) => project.name === target)
    if (proj.name !== 'env' && proj.active_proj) {
      listProjects.push(proj);
    }
  }

  else if(targets!==undefined){
    targets.forEach(async (targetItem) => {
      proj = projects.find((project) => project.name === targetItem)
      if (proj.name !== 'env' && proj.active_proj) {
        listProjects.push(proj);
      }
    });
  }


  return { project, projects, actions, environment, setupFile, listProjects, target, cache, opts: options };
};

const extractActions = (actions) => {
  const actionsList = actions.split(',').map((action) => action.trim());
  return { actionsList };
};

const validateArgs = (environment, actions, project, target, targets) => {
  if (( (!target.includes('all'))  && (targets===undefined)  ) && !project?.active_proj && !project?.active_repo) {
    throw new Error('--target argument is required');
  }
  if (!actions) {
    throw new Error('--actions argument is required');
  }
  if (!environment) {
    throw new Error('--env argument is required');
  }
  // if (!project) {
  //   throw new Error('project in --target argument not defined or not active ');
  // }
};

const checkRunProject =  (moduleName) => {
  const module = moduleName.toLowerCase();
  const typeProject = module.includes('subgraph') ? 'SUBSCHEMA' : 'SUPERSCHEMA';
  const runProcess = typeProject==='SUBSCHEMA' ? true : false;
  return { runProcess };
}

const buildTasks = (action, _args, runProcess, cache, opts) => {
  let taskProcess = undefined;
  let taskPost = undefined;
  let args = { ..._args, opts } 
  // if (action === 'new') { taskProcess = { task: newJob, args, ord: 1 } }
  if (action === 'stop') { taskProcess = { task: stopJob, args, ord: 1 } }
  if (action === 'clear') { taskProcess = { task: clearJob, args, ord: 2 } }
  if (action === 'clear-rep') { taskProcess = { task: clearRepo, args, ord: 2 } }
  if (action === 'update') { taskProcess = { task: updateJob, args, ord: 3 } }
  if (action === 'ext') { taskProcess = { task: extractJob, args, ord: 4 } }
  if (action === 'install') {  taskProcess = { task: installJob, args, ord: 4  } }
  if (action === 'build' ) { taskProcess = { task: buildJob, args, ord: 6 } }
  if (action === 'run' ) { taskProcess = { task: runProject, args: { ..._args, opts: 'generator' } , ord: 7 } }
  if (action === 'start') { taskProcess = { task: startJob, args, ord: 8 } }
  if (action === 'restart') { taskProcess = { task: restartProject, args, ord: 9 } }
  if (action === 'update-rep') { taskProcess = { task: reposProject, args, ord: 10 } }
  if (action === 'restart-rep') { taskProcess = { task: restartRepoProject, args, ord: 11 } }
  return {taskProcess, taskPost}
}
const listPathsForExtract = [];
const listJobs = (options, actionsList) => {
  const { listProjects, environment, cache, opts } = options;
  const list = [];
  const listArgs = []
  let isExtract = false;
  listProjects.forEach((projectSetup) => {
    actionsList.forEach((action) => {
      isExtract = action.includes('extract') ? true : isExtract;
      if (!isExtract) {
        const { args } = getArgs(projectSetup, action, environment, cache);
        const { runProcess } = checkRunProject(args.name_module.toLowerCase())
        const { taskProcess, taskPost } = buildTasks(action, args, runProcess, cache, opts)
        let task = taskProcess;
        list.push(task);
        if (taskPost) {
          task = taskPost;
          list.push(task);
        }
      } else {
        listPathsForExtract.push(projectSetup)
      }

    });
  });

  if (isExtract) {
    
    listProjects.forEach((projectSetup) => {
    const {args} = getArgs(projectSetup, 'ext', environment, cache)

      listArgs.push({ name: args.name, paths: args.paths, name_module: args.name_module })
    });



    list.push({ task: extractJob, args: listArgs , ord: 4 });
  }

  const jobs = list.sort(compare);
  return { jobs };
};

const startJobs = async () => {
  const startTime = new Date();

  console.log('');
  console.log('The assistant preparing jobs for work, please wait...');
  const options =  await extractArgs();
  const { actionsList } = extractActions(options.actions);
  const { jobs } = listJobs(options, actionsList);
  console.log('initialized works jobs...');
  console.log('');

  await sequence(
    jobs.map((job) => async () => {
      if(job){
        const { task, args } = job;
        const startTimeJob = new Date();
        const args_ = { ...args, startTimeJob };
        await task(args_);
        
      }
    })
  );
  console.log('');
  console.log('All jobs completed!');
  console.log('Cost Time Total: '+ showCostTime(startTime));
  console.log('');
};

console.log('');
// startJobs();

module.exports = {
  startJobs,
};

