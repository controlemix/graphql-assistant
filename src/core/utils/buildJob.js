const yaml = require('yamljs');
const clc = require('cli-color');
const path = require('path');
const sequence = require('promise-sequence/lib/sequence');
const { genList, extension, forwardArgs, fixed, lowerCaseFirstLetter, upperCaseFirstLetter, genListSuper, sleep } = require('./constants');
const { writeFile } = require('./fs');
const { showCostTime } = require('@lzwme/dir-fast-copy/dist/utils');

const stampJob = (defs, position) => {
  const { appName, pathBase, startTimeJob } = defs;
  if (position === 'start') {
    console.log(clc.magentaBright('BUILD -----------------  PROJS:   [X]'));
    console.log(clc.magentaBright('-----------------------  REPOS:   [ ]'));
    console.log(`Project     : ${appName}`);
    console.log(`Path        : ${pathBase}`);
    console.log('');
    console.log('working, please await...');
  }
  if (position === 'center') {
    console.log('');
    console.log(`Build:`);
    console.log('-------------------------------------');
  }
  if (position === 'end') {
    console.log('');
    console.log('job done in '+ showCostTime(startTimeJob));
    console.log(clc.magentaBright('-------------------------------------'));
    console.log('');
  }
}

function promiseArgs(args, argsTypeName, typeArgsName, pathBase) {
  const { fields, extraConditions } = args;
  let argFields = '';

  fields.map( function (arg) {
    argFields += `${arg.name}: { description: '${arg.description}', type: require('graphql').${arg.typeGraphQL} },\n`;
  });

  const data = `const ${argsTypeName} = {\n    ${argFields}}\n\nmodule.exports = { condition: (_, table, args) => { return require('subgraph-tools').conditionWhere(table, args) }, args: { ...${argsTypeName}, ...require('./forwardArgs').argsDefault.args}}`;
  let path = path.join(pathBase, 'src/schema/types/args/', `${typeArgsName}.js`);
  return { task: writeFile, path, data, taskMsg: clc.blueBright, msg: `Arg         : ${typeArgsName}` }
}

const createTypeAndArgsFiles =  (defs) => {
    const { api, seeds,  paths } = defs;
    const listFiles = [];
    const { recreateTypeFiles, recreateArgs, recreateFields, createFiles, skipExistingFiles } = api;
    const pathCheck = paths.baseAppPaths.folder_proj;

    if (createFiles && !skipExistingFiles) {
      seeds.map(async function (seed) {

        const typeArgsName = lowerCaseFirstLetter(seed.seed.definitions.typeArgsName);
        const argsTypeName = lowerCaseFirstLetter(seed.seed.definitions.argsTypeName);
        const adaptTypeName = lowerCaseFirstLetter(seed.seed.definitions.adaptTypeName);
        const typeName = upperCaseFirstLetter(seed.seed.definitions.typeName);
        const { resolver, resolveType, isNode } = seed.seed.definitions;

        const { fields, extraConditions } = seed.seed.args;
        const { joinFields } = seed.seed;
        let argFields = '';

        fields.map(async function (arg) {
          argFields += `${arg.name}: { description: '${arg.description}', type: require('graphql').${arg.typeGraphQL} },\n`;
        });

        const args = `const ${argsTypeName} = {\n    ${argFields}}\n\nmodule.exports = { condition: (_, table, args) => { return require('subgraph-tools').conditionWhere(table, args) }, args: { ...${argsTypeName}, ...require('./forwardArgs').argsDefault.args}}`;
        let pathFile = path.join(pathCheck, 'src/schema/types/args/', `${typeArgsName}.js`);
        if (recreateArgs) {
          listFiles.push({task: writeFile, path: pathFile, data: args});
          console.log(clc.blueBright(`Arg         : ${typeArgsName}`));
        }

        let list = '';
        let joinTypes = '';
        let fieldsForJoin = `\nconst fields = {\n      ...FieldsForType,\n`;
        let activeOneJoin = false;

        if (joinFields.active) {
          joinFields.fields.map(function (fieldJoinType) {
            if (fieldJoinType.active) {
              activeOneJoin = true;
              joinTypes += `const { ${fieldJoinType.type} } = require('../${fieldJoinType.type}');\n`;
            }
          });
          joinFields.fields.map(function (jField) {
            if (jField.active && activeOneJoin) {
              fieldsForJoin += `${extension(jField.type, jField.typeGraphQL, jField, jField.extraConditions).replace(
                ', AND',
                'AND'
              )}`;
            }
          });
          fieldsForJoin = `${fieldsForJoin}};`;
          if (activeOneJoin) {
            list = `const { GraphQLList } = require('graphql');`;
          }
        } else {
          fieldsForJoin += `}`;
        }

        const field = `const { SQL, FieldsForType } = require('subgraph-tools').getFieldsAndSQL('${typeName}');\n${list}\n${joinTypes}${fieldsForJoin}\n\nconst ${adaptTypeName} = require('subgraph-tools').generateAdaptType( SQL, 'clearID', require('../args/${typeArgsName}').condition, true,\n{ ...require('../args/forwardArgs').forwardArgs, ...require('../args/${typeArgsName}').args }, fields,\n{ name: '${typeName}', resolver: ${resolver}, resolveType: ${resolveType}, isNode: ${isNode} });\n\nmodule.exports = { ${adaptTypeName} };`;
        pathFile = path.join(pathCheck, 'src/schema/types/fields/', `${typeName}.js`);
        if (recreateFields) {
          listFiles.push({task: writeFile, path: pathFile, data: field});
          console.log(clc.greenBright(`Field       : ${typeName}`));
        }

        const type = `\nconst { GraphQLObjectType } = require('graphql');\nconst ${typeName} = new GraphQLObjectType({ name: '${typeName}', description: '${typeName} type', ...require('./fields/${typeName}').${adaptTypeName} });\nconst { connectionType: ${typeName}Connection } = require('graphql-relay').connectionDefinitions({ nodeType: ${typeName}, connectionFields: { total: { type: require('graphql').GraphQLInt } } });\nconst ${typeName}Adapt = { type: ${typeName}Connection, ...require('./fields/${typeName}').${adaptTypeName} };\nmodule.exports = { ${typeName}, ${typeName}Connection, ${typeName}Adapt };`;
        pathFile = path.join(pathCheck, 'src/schema/types/', `${typeName}.js`);
        if (recreateTypeFiles) {
          listFiles.push({task: writeFile, path: pathFile, data: type});
          console.log(clc.cyanBright(`Type        : ${typeName}`));
        }
        pathFile = path.join(pathCheck, 'src/schema/types/args/', `forwardArgs.js`);
        listFiles.push({task: writeFile, path: pathFile, data: forwardArgs});
        pathFile = path.join(pathCheck, 'src/schema/types/fields/', `Fixed.js`);
        listFiles.push({task: writeFile, path: pathFile, data: fixed});
      });
    }
    return listFiles;
  }

const getSeeds = (pathSeeds) => {
  let seedList = [];
  require('fs')
    .readdirSync(pathSeeds)
    .forEach(function (_file_) {
      if (_file_.match(/\.yaml$/) !== null && _file_ !== 'index.js' && _file_ !== 'types.js') {
        const _path_file = `${pathSeeds + _file_}`;
        const _seedType = yaml.load(_path_file);
        seedList.push({ seed: _seedType, file: _file_ });
      }
    });
  return seedList;
};

const startBuild = async (defs) => {
  const builds = defs.api.modName==='subgraph-tools' ? genList(defs) : genListSuper(defs);
  await sequence(
    builds.map((build) => async () => {
      const { task, type, target, data, path, from, to, force } = build
      if (task !== undefined) {
        if (type === 'F' && force) {
          await task(`${path}${target}`, data, 'utf8')
        } else if (type === 'D') {
          await task(`cd ${path} && mkdir ${target}`, 'localhost')
        } else if (type === 'C') {
          await task(from, to)
        }
      }
    })
  );
};

const createFiles = async (defs) => {
  const files =  createTypeAndArgsFiles(defs);
  await sequence(
    files.map((file) => async () => {
      const { task, path, data} = file;
      await task(path, data)
    })
  );
};

const buildJob = async (options) => {
  const { apiSetupFile, paths, startTimeJob } = options;
  
  const defs = {
    createFiles: apiSetupFile.api.createFiles,
    ecosystemRecreate: apiSetupFile.ecosystem.recreate,
    packageJsonRecreate: apiSetupFile.package.recreate,
    pathSeeds: path.join(paths.baseAppPaths.folder_proj, 'config', '/seeds/'),
    seeds: apiSetupFile.api.modName==='subgraph-tools' ? getSeeds(path.join(paths.baseAppPaths.folder_proj, 'config', '/seeds/')) : undefined,
    pathBase: paths.baseAppPaths.folder_proj,
    appName: apiSetupFile.api.name.toUpperCase(),
    options,
    api: apiSetupFile.api,
    apiSetupFile,
    paths,
    startTimeJob
  };
 
  stampJob(defs, 'start');

  if (defs.createFiles) {
    await startBuild(defs);
    stampJob(defs, 'center');
    if(apiSetupFile.api.modName==='subgraph-tools'){
      await createFiles(defs);
    }
  }
  // await exec(`cd ${paths.baseAppPaths.folder_proj} && npm run gen`, 'localhost')
  // await execExtra(`cd ${paths.baseAppPaths.folder_proj} &&  node -r esm ./src/index.js environment=development generator=true`)
  // if(defs.api.modName==='subgraph-tools'){
    // try {
    //   await exec(`cd ${paths.baseAppPaths.folder_proj} && node -r esm ./src/index.js environment=localhostp generator`);
      
    // } catch (error) {
      
    // }

  // }
  // await exec(`cd ${paths.baseAppPaths.folder_proj} &&  node -r esm ./src/index.js environment=localhostp generator=true`);
  stampJob(defs, 'end');
};

module.exports = { buildJob };
