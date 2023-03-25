const yaml = require('yamljs');
const fs = require('fs');
const path = require('path');
const { writeFile, readFile, runCommand, copyNodeModule } = require('./versionFsSync');

async function jsonToYaml(pathFile, dataFile) {
  return fs.writeFileSync(pathFile, require('js-yaml').dump(dataFile));
}

const ecosystemFactory = async (paths) => {
  let ecosystemJSON = require('../../../config/templates/ecosystem.json');
  const { api } = yaml.load(paths.baseAppPaths.api_setup);
  const { name, ecosystem } = api;
  const { development, localhost } = ecosystem;

  ecosystemJSON.apps[0].name = `${name}-API`;

  /* development */
  ecosystemJSON.apps[0].env_development.DATABASE01_USER = development.DATABASE01_USER;
  ecosystemJSON.apps[0].env_development.DATABASE01_PASS = development.DATABASE01_PASS;
  ecosystemJSON.apps[0].env_development.DATABASE01_DB_NAME = development.DATABASE01_DB_NAME;
  ecosystemJSON.apps[0].env_development.DATABASE01_HOST = development.DATABASE01_HOST;
  ecosystemJSON.apps[0].env_development.DATABASE01_PORT = development.DATABASE01_PORT;
  ecosystemJSON.apps[0].env_development.SERVICE_NAME = name;
  ecosystemJSON.apps[0].env_development.SCHEMA_CONFIG = ecosystem.SCHEMA_CONFIG;
  ecosystemJSON.apps[0].env_development.GRAPHQL_PATH = ecosystem.GRAPHQL_PATH;
  ecosystemJSON.apps[0].env_development.API_URL = development.API_URL;
  ecosystemJSON.apps[0].env_development.PORT = development.PORT;

  /* localhostp */
  ecosystemJSON.apps[0].env_localhosta.watch = localhost.watch;
  ecosystemJSON.apps[0].env_localhostp.DATABASE01_USER = development.DATABASE01_USER;
  ecosystemJSON.apps[0].env_localhostp.DATABASE01_PASS = development.DATABASE01_PASS;
  ecosystemJSON.apps[0].env_localhostp.DATABASE01_DB_NAME = development.DATABASE01_DB_NAME;
  ecosystemJSON.apps[0].env_localhostp.DATABASE01_HOST = development.DATABASE01_HOST;
  ecosystemJSON.apps[0].env_localhostp.DATABASE01_PORT = development.DATABASE01_PORT;
  ecosystemJSON.apps[0].env_localhostp.SERVICE_NAME = name;
  ecosystemJSON.apps[0].env_localhostp.SCHEMA_CONFIG = ecosystem.SCHEMA_CONFIG;
  ecosystemJSON.apps[0].env_localhostp.GRAPHQL_PATH = ecosystem.GRAPHQL_PATH;
  ecosystemJSON.apps[0].env_localhostp.API_URL = development.API_URL;
  ecosystemJSON.apps[0].env_localhostp.PORT = development.PORT;

  /* localhosta */
  ecosystemJSON.apps[0].env_localhosta.watch = localhost.watch;
  ecosystemJSON.apps[0].env_localhosta.DATABASE01_USER = localhost.DATABASE01_USER;
  ecosystemJSON.apps[0].env_localhosta.DATABASE01_PASS = localhost.DATABASE01_PASS;
  ecosystemJSON.apps[0].env_localhosta.DATABASE01_DB_NAME = localhost.DATABASE01_DB_NAME;
  ecosystemJSON.apps[0].env_localhosta.DATABASE01_HOST = localhost.DATABASE01_HOST;
  ecosystemJSON.apps[0].env_localhosta.DATABASE01_PORT = localhost.DATABASE01_PORT;
  ecosystemJSON.apps[0].env_localhosta.SERVICE_NAME = name;
  ecosystemJSON.apps[0].env_localhosta.SCHEMA_CONFIG = ecosystem.SCHEMA_CONFIG;
  ecosystemJSON.apps[0].env_localhosta.GRAPHQL_PATH = ecosystem.GRAPHQL_PATH;
  ecosystemJSON.apps[0].env_localhosta.API_URL = localhost.API_URL;
  ecosystemJSON.apps[0].env_localhosta.PORT = localhost.PORT;  

  await jsonToYaml(options.paths.baseAppPaths.ecosystem, ecosystemJSON);
  return true;
};

module.exports = { ecosystemFactory };



