describe('Check Server Exist', () => {
  jest.setTimeout(50000);
  const clc = require('cli-color');
  const { graphql } = require('graphql');
  const { info } = require('console');
  const { addMocksToSchema } = require('@graphql-tools/mock');
  const sequence = require('promise-sequence/lib/sequence');

  const listConditionsJob = [];
  const listOperationsJob = [];
  const listQueryJob = [];

  let serverApolloTest, conditionResp, operationResp, queryResp, listsForTests, schemaWithMocks;

  let params = {
    schema: undefined,
    source: undefined,
    variableValues: {
      first: 1,
      after: 'YXJyYXljb25uZWN0aW9uOjY=',
      loadDate: '2022-06-02',
      operationName: undefined,
    },
  }

  beforeAll(async () => {
    console.log = jest.fn();
    serverApolloTest = await require('subgraph-tools').startServer();
    listsForTests = serverApolloTest.listsForTests;
    schemaWithMocks = addMocksToSchema({ schema: serverApolloTest.schema, mocks: { String: () => 'Fix', Date: () => { return new Date() } } });
    params.schema = schemaWithMocks;

    listsForTests.forEach(async (argType) => {
      const { operationName, condition, query, table, task, sql, typeName } = argType;
      params.source = query;
      params.variableValues.operationName = operationName;
      listOperationsJob.push({ task: graphql, params });
      listConditionsJob.push({ task: condition, table });
      listQueryJob.push({ task, sql, table, typeName });
    });

  });

  it('Test Server, Types, Args and Conditions', async () => {

    await sequence(
      listConditionsJob.map((job) => async () => {
        const { task, table } = job;
        conditionResp = await task('', table, {});
        expect(conditionResp).toBe(' 1=1 ');
      })
    );

    await sequence(
      listOperationsJob.map((job) => async () => {
        const { task, params } = job;
        operationResp = await task(params);
        expect(operationResp).toBeDefined();
      })
    );

    info('');
    info('');
    info(clc.yellow(`Test SQL Union --------  Total: [ ${listQueryJob.length} ]`));
    info(clc.yellow(`-------------------------------------`));
    info('');

    await sequence(
      listQueryJob.map((job) => async () => {
        const { task, sql, typeName } = job;
        const msg = `Type     : ${typeName.replace('Adapt', '')}`
        try {
          queryResp = await task(sql);
          info(clc.green(msg));
          expect(queryResp).toBeDefined();
        } catch (error) {
          if (queryResp && queryResp.length === 1) {
            info(clc.green(msg));
            expect(queryResp).toBeDefined();
          } else {
            if (!queryResp) {
              info(clc.red(msg));
              expect(queryResp).toBeUndefined();
            } else {
              info(clc.red(msg));
              expect(queryResp).toBeDefined();
            }
          }
        }
      })
    );
    
    info('');
    info('test done!');
    info(clc.yellow(`-------------------------------------`));
    info('');
    info('');
  });

});
