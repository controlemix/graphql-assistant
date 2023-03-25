const path = require('path');
const { createDir, writeFile, copyDir } = require('./fs');
const { runCommand } = require('./versionFsSync');
function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms))}

const upperCaseFirstLetter = (str) => {
  let firstLetter = str.substr(0, 1);
  return firstLetter.toUpperCase() + str.substr(1);
}
const lowerCaseFirstLetter = (str) => {
  let firstLetter = str.substr(0, 1);
  return firstLetter.toLowerCase() + str.substr(1);
}



const indexData = `
async function startServerApollo() {
  const { server, schema, listsForTests } = await require('subgraph-tools').startServer();
  return { server, schema, listsForTests };
}
startServerApollo();
module.exports = { startServerApollo };
`;

const fixed = `
const { GraphQLNonNull } = require("graphql");
const fixedFields = [
  { id: { type: new GraphQLNonNull(require("graphql").GraphQLID), ...require("graphql-relay").globalIdField() } },
  { clearID: {} },
  { sourceSystem: {} },
  { loadDate: {} },
  { updateDate: {} },
];

module.exports = { fixedFields };
`

const outData = `file for logs out `
const errorData = `file for logs errors`
const nodemonData = `
{
    "verbose": true,
    "watch": [
      "src/schema/types/**",
      "src/gateway/schemas/seeds/patterns/**",
      "src/index.js",
      "./package.json"
    ],
    "ext": "js, json",
    "ignore": [
      ".git",
      ".gql",
      ".graphql",
      "node_modules/**/node_modules",
      "logs",
      ".scannerwork",
      "coverage"
    ],
    "delay": 1000
  }
`
const packageData = ``;
const ecosystemData = ``;

const forwardArgs = `
const forwardArgs = {
    id: {
      description: 'ID of the object',
      type: require('graphql').GraphQLID,
    },
    first: {
      description: 'The number of objects to return',
      type: require('graphql').GraphQLInt,
    },
    after: {
      description: 'The cursor to continue',
      type: require('graphql').GraphQLString,
    },
  };
  
  const argsForwardType = {
    loadDate: {
      description: 'Load date of payment to return',
      type: require('graphql').GraphQLString,
    },
    updateDate: {
      description: 'Update date of payment to return',
      type: require('graphql').GraphQLString,
    },
    sourceSystem: {
      description: 'The source system of the payment to return',
      type: require('graphql').GraphQLString,
    },
  };
  
  module.exports = { 
    forwardArgs,
    argsDefault: { args: { ...argsForwardType } } 
  };
`


const imagesPath = path.join(__dirname, '../../../', 'config/templates/public/images');
const genList = (defs) => [
    // { task: writeFile, tag: 'package.json', target: 'package.json', type: 'F', data: packageData, path: path.join(defs.pathBase, 'package.json'), from: undefined, to: undefined, force: false, skip: false },
    // { task: writeFile, tag: 'nodemon.json', target: 'nodemon.json', type: 'F', data: nodemonData, path: path.join(defs.pathBase, 'nodemon.json'), from: undefined, to: undefined, force: false, skip: false }, 
    // { task: writeFile, tag: 'ecosystem.yaml', target: 'ecosystem.yaml', type: 'F', data: ecosystemData, path: path.join(defs.pathBase, 'ecosystem.yaml'), from: undefined, to: undefined, force: false, skip: false },
    { task: runCommand, tag: 'src', target: 'src', type: 'D', data: undefined, path: path.join(defs.pathBase) , from: undefined, to: undefined, force: true, skip: false },
    { task: runCommand, tag: 'src/schema', target: 'schema', type: 'D', data: undefined, path: path.join(defs.pathBase, 'src/') , from: undefined, to: undefined, force: true, skip: false }, 
    { task: runCommand, tag: 'src/schema/gql', target: 'gql', type: 'D', data: undefined, path: path.join(defs.pathBase, 'src/schema/') , from: undefined, to: undefined, force: true, skip: false },
    { task: runCommand, tag: 'src/schema/operations', target: 'operations', type: 'D', data: undefined, path: path.join(defs.pathBase, 'src/schema/') , from: undefined, to: undefined, force: true, skip: false },
    { task: runCommand, tag: 'src/schema/types', target: 'types', type: 'D', data: undefined, path: path.join(defs.pathBase, 'src/schema/') , from: undefined, to: undefined, force: true, skip: false },
    { task: runCommand, tag: 'src/schema/types/args', target: 'args', type: 'D', data: undefined, path: path.join(defs.pathBase, 'src/schema/types/') , from: undefined, to: undefined, force: true, skip: false },
    { task: runCommand, tag: 'src/schema/types/fields', target: 'fields', type: 'D', data: undefined, path: path.join(defs.pathBase, 'src/schema/types/') , from: undefined, to: undefined, force: true, skip: false },
    { task: runCommand, tag: 'config/data-files', target: 'data-files', type: 'D', data: undefined, path: path.join(defs.pathBase, 'config/') , from: undefined, to: undefined, force: true, skip: false },
    { task: runCommand, tag: 'config/data-files/data-001', target: 'data-001', type: 'D', data: undefined, path: path.join(defs.pathBase, 'config/data-files/') , from: undefined, to: undefined, force: true, skip: false },      
    { task: runCommand, tag: 'config/data-files/data-001/tables', target: 'tables', type: 'D', data: undefined, path: path.join(defs.pathBase, 'config/data-files/data-001/') , from: undefined, to: undefined, force: true, skip: false },
    { task: runCommand, tag: 'config/data-files/data-001/schemas', target: 'schemas', type: 'D', data: undefined, path: path.join(defs.pathBase, 'config/data-files/data-001/') , from: undefined, to: undefined, force: true, skip: false },
    { task: writeFile, tag: 'config/data-files/data-001/schemas/db-seeds.yaml', target: 'db-seeds.yaml', type: 'F', data: '', path: path.join(defs.pathBase, 'config/data-files/data-001/schemas/') , from: undefined, to: undefined, force: true, skip: false }, //
    // { task: runCommand, tag: 'packages', target: 'packages', type: 'D', data: undefined, path: path.join(defs.pathBase) , from: undefined, to: undefined, force: true, skip: false },
    { task: runCommand, tag: 'logs', target: 'logs', type: 'D', data: undefined, path: path.join(defs.pathBase) , from: undefined, to: undefined, force: true, skip: false },
    { task: runCommand, tag: 'logs/errors', target: 'errors', type: 'D', data: undefined, path: path.join(defs.pathBase, 'logs/') , from: undefined, to: undefined, force: true, skip: false },
    { task: runCommand, tag: 'public', target: 'public', type: 'D', data: undefined, path: path.join(defs.pathBase) , from: undefined, to: undefined, force: true, skip: false },
    { task: writeFile, tag: 'public/index.html', target: 'index.html', type: 'F', data: 'ND', path: path.join(defs.pathBase, 'public/') , from: undefined, to: undefined, force: true, skip: false }, //
    { task: writeFile, tag: 'logs/out.log', target: 'out.log', type: 'F', data: outData, path: path.join(defs.pathBase, 'logs/') , from: undefined, to: undefined, force: true, skip: false }, //
    { task: copyDir, tag: 'public/images', target: 'images', type: 'C', data: 'ND', path: path.join(defs.pathBase, 'public/') , from: imagesPath, to: path.join(defs.pathBase, 'public/images'), force: true, skip: false }, //
    { task: writeFile, tag: 'logs/errors/error.log', target: 'error.log', type: 'F', data: errorData, path: path.join(defs.pathBase, 'logs/errors/') , from: undefined, to: undefined, force: true, skip: false }, //
    { task: writeFile, tag: 'src/index.js', target: 'index.js', type: 'F', data: indexData, path: path.join(defs.pathBase, 'src/') , from: undefined, to: undefined, force: true, skip: false },
];
const genListSuper = (defs) => [
    // { task: writeFile, tag: 'package.json', target: 'package.json', type: 'F', data: packageData, path: path.join(defs.pathBase, 'package.json'), from: undefined, to: undefined, force: false, skip: false },
    // { task: writeFile, tag: 'nodemon.json', target: 'nodemon.json', type: 'F', data: nodemonData, path: path.join(defs.pathBase, 'nodemon.json'), from: undefined, to: undefined, force: false, skip: false }, 
    // { task: writeFile, tag: 'ecosystem.yaml', target: 'ecosystem.yaml', type: 'F', data: ecosystemData, path: path.join(defs.pathBase, 'ecosystem.yaml'), from: undefined, to: undefined, force: false, skip: false },
    // { task: runCommand, tag: 'packages', target: 'packages', type: 'D', data: undefined, path: path.join(defs.pathBase) , from: undefined, to: undefined, force: true, skip: false },
    { task: runCommand, tag: 'logs', target: 'logs', type: 'D', data: undefined, path: path.join(defs.pathBase) , from: undefined, to: undefined, force: true, skip: false },
    { task: runCommand, tag: 'logs/errors', target: 'errors', type: 'D', data: undefined, path: path.join(defs.pathBase, 'logs/') , from: undefined, to: undefined, force: true, skip: false },
    { task: runCommand, tag: 'public', target: 'public', type: 'D', data: undefined, path: path.join(defs.pathBase) , from: undefined, to: undefined, force: true, skip: false },
    { task: writeFile, tag: 'public/index.html', target: 'index.html', type: 'F', data: 'ND', path: path.join(defs.pathBase, 'public/') , from: undefined, to: undefined, force: true, skip: false }, //
    { task: writeFile, tag: 'logs/out.log', target: 'out.log', type: 'F', data: outData, path: path.join(defs.pathBase, 'logs/') , from: undefined, to: undefined, force: true, skip: false }, //
    { task: copyDir, tag: 'public/images', target: 'images', type: 'C', data: 'ND', path: path.join(defs.pathBase, 'public/') , from: imagesPath, to: path.join(defs.pathBase, 'public/images'), force: true, skip: false }, //
    { task: writeFile, tag: 'logs/errors/error.log', target: 'error.log', type: 'F', data: errorData, path: path.join(defs.pathBase, 'logs/errors/') , from: undefined, to: undefined, force: true, skip: false }, //
];


async function createEcosystemFile(apiSetup, pathEcosystemFile) {
    const {
        apiName,
        createFiles,
        forceRecreateEcosystem,
        developmentPort,
        localhostPort
    } = apiSetup.api[0];

    if (createFiles && forceRecreateEcosystem) {


        const ecosystem = `
        apps:
          - name: ${apiName}-API
            script: ./src/index.js
            cwd: .
            interpreter: node
            exec_interpreter: node
            exec_mode: cluster
            instances: 1
            increment_var: PORT
            interpreter_args: -r esm
            args: -r esm    
            max_memory_restart: 256M
            source_map_support: true
            instance_var: NODE_APP_INSTANCE
            treekill: true
            min_uptime: 5000
            listen_timeout: 8000
            kill_timeout: 1600
            wait_ready: true
            max_restarts: 100000
            restart_delay: 2000
            autorestart: true
            cron_restart: 1 0 * * *
            vizion: false
            force: true
            shutdown_with_message: true
            log_date_format: YYYY-MM-DD HH:mm Z
            error_file: ./logs/errors/error.log
            out_file: ./logs/out.log
            combine_logs: true
            log_type: raw
            env:
              CORS_HEADER:
                - https://studio.apollographql.com
                - https://studio.apollographql.com/sandbox/explorer
                - http://localhost
                - https://fonts.googleapis.com
                - https://cdn.jsdelivr.net
                - https://code.jquery.com
                - https://apollo-server-landing-page.cdn.apollographql.com
                - https://sentry.io
                - https://cdn.ravenjs.com
                - https://js.recurly.com
                - https://studio-ui-deployments.apollographql.com
                - https://fonts.gstatic.com
                - https://www.gstatic.com
                - https://www.googletagmanager.com
         
            env_development:
              namespace: development
              NODE_ENV: development
              node_args: environment=development
              watch: false
              DATABASE01_USER: XPTO
              DATABASE01_PASS: XPTO
              DATABASE01_DB_NAME: XPTO
              DATABASE01_HOST: XPTO
              DATABASE01_PORT: 1433
              SERVICE_NAME: ${apiName}
              SERVICE_MOCK: 0
              ENDPOINT_HEALTH: /.well-known/apollo/server-health
              SCHEMA_CONFIG: pattern-001.yaml
              GRAPHQL_PATH: /
              API_URL: http://localhost
              PORT: ${parseInt(developmentPort)}
              AUTO_RESTART: 1
              GATEWAY_AUTH: 1
              GATEWAY_AUTH_TYPE: local
              GATEWAY_CREDENTIALS_USER: USER
              GATEWAY_CREDENTIALS_PASS: XPTO
              GATEWAY_URL: http://localhost
              CORS_HEADER:
                - http://localhost
        
            env_localhosta:
              namespace: localhosta
              NODE_ENV: localhosta
              node_args: environment=localhosta
              watch: 
                - src/schema/types
                - src/index.js
                - package.json
              DATABASE01_USER: XPTO
              DATABASE01_PASS: XPTO
              DATABASE01_DB_NAME: XPTO
              DATABASE01_HOST: XPTO
              DATABASE01_PORT: 1433
              SERVICE_NAME: ${apiName}
              SERVICE_MOCK: 0
              ENDPOINT_HEALTH: /.well-known/apollo/server-health
              SCHEMA_CONFIG: pattern-001.yaml
              GRAPHQL_PATH: /
              API_URL: http://localhost:8093
              PORT: ${parseInt(localhostPort)}
              AUTO_RESTART: 1
              GATEWAY_AUTH: 1
              GATEWAY_AUTH_TYPE: local
              GATEWAY_CREDENTIALS_USER: user
              GATEWAY_CREDENTIALS_PASS: xpto
              GATEWAY_URL: http://localhost:4000
              CORS_HEADER:
                - http://localhost:4000
        
            env_localhostp:
              namespace: localhostp
              NODE_ENV: localhostp
              node_args: environment=localhostp
              watch: 
                - src/schema/types
                - src/index.js
                - package.json
              DATABASE01_USER: XPTO
              DATABASE01_PASS: XPTO
              DATABASE01_DB_NAME: XPTO
              DATABASE01_HOST: XPTO
              DATABASE01_PORT: 1433
              SERVICE_NAME: ${apiName}
              SERVICE_MOCK: 0
              ENDPOINT_HEALTH: /.well-known/apollo/server-health
              SCHEMA_CONFIG: pattern-001.yaml
              GRAPHQL_PATH: /
              API_URL: http://localhost:8093
              PORT: ${parseInt(localhostPort)}
              AUTO_RESTART: 1
              GATEWAY_AUTH: 1
              GATEWAY_AUTH_TYPE: local
              GATEWAY_CREDENTIALS_USER: user
              GATEWAY_CREDENTIALS_PASS: xpto
              GATEWAY_URL: http://localhost:4000
              CORS_HEADER:
                - http://localhost:4000
           
            env_test:
              namespace: test
              NODE_ENV: test
              node_args: environment=test
              watch: false
              DATABASE01_USER: XPTO
              DATABASE01_PASS: XPTO
              DATABASE01_DB_NAME: XPTO
              DATABASE01_HOST: XPTO
              DATABASE01_PORT: 1433
              SERVICE_NAME: ${apiName}
              SERVICE_MOCK: 1
              ENDPOINT_HEALTH: /.well-known/apollo/server-health
              SCHEMA_CONFIG: pattern-001.yaml
              GRAPHQL_PATH: /
              API_URL: http://localhost:8093 
              PORT: 0
              AUTO_RESTART: 0
              GATEWAY_AUTH: 1
              GATEWAY_AUTH_TYPE: basic
              GATEWAY_CREDENTIALS_USER: user
              GATEWAY_CREDENTIALS_PASS: xpto
              GATEWAY_URL: http://localhost:4000
              CORS_HEADER:
                - http://localhost:4000
        `
        
        const isExist = await fileExists(pathEcosystemFile);
        if(!isExist) {
          await writeFile(pathEcosystemFile, ecosystem )
          console.log('Ecosystem file recreated');
        }
    }    

}

async function createPackageFile(apiSetup, pathPackageFile) {
    const {
        apiName,
        environment,
        packageName,
        packageVersion,
        subgraphModVer,
        createFiles,
        forceRecreatePackageJSON
    } = apiSetup.api[0];

    if (createFiles && forceRecreatePackageJSON) {
        let packageTemplate = yaml.load(`./config/templates/package.yaml`);
        packageTemplate.name = packageName;
        packageTemplate.version = packageVersion;
        packageTemplate.dependencies['subgraph-tools'] = `file:packages/subgraph-tools-${subgraphModVer}.tgz`;
        packageTemplate.scripts.start = `pm2 start ecosystem.yaml --env ${environment} --only ${apiName}-API --update-env`;
        packageTemplate.scripts.stop = `pm2 delete ecosystem.yaml --env ${environment} --only ${apiName}-API`;
        await writeFile(pathPackageFile, JSON.stringify(packageTemplate, null, 2));
        console.log('package.json file recreated');
        
    }

}

function extension(type, typeGraphQL, jField, extraConditions) {
    let listKeys = Object.keys(jField.joins);
    let constListWhere = []
    listKeys.forEach(key => {
        constListWhere.push(jField.joins[key])
    });
    let fndTmp = ''
    let jType = typeGraphQL === 'GraphQLList'? `type: new GraphQLList(${type})`: `type: ${type}`
    return  `
      ${jField.name}: {
        ${jType},
        description: '${jField.description}',
        extensions: {
          joinMonster: {
            sqlJoin: (unionTable, joinTable ) =>
            ${
                '`'+constListWhere.map( function (joinFd) {
             let fndPre =   '${joinTable}'+`.${joinFd[0]}`+' = ${unionTable}'+`.${joinFd[1]} `
             fndTmp = fndTmp == '' ? fndPre : ' AND ' + fndPre
             return fndTmp
            })+'`'
            
            }
          },
        },
      },
    ` ;
}



module.exports = {
    sleep,
    genList,
    extension,
    forwardArgs,
    fixed,
    upperCaseFirstLetter,
    lowerCaseFirstLetter,
    genListSuper
}