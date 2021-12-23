import fastify from 'fastify';
import plugin from '../src/service-api';
import { ItemMembershipService, ItemService } from 'graasp';
import { TaskRunner, ItemTaskManager, ItemMembershipTaskManager } from 'graasp-test';
import schemas from '../src/schemas/common';

type props = {
  runner: TaskRunner;
  itemDbService: ItemService;
  itemMemberhipDbService: ItemMembershipService;
  verifyAuthenticationMock?: () => void;
  itemMembershipTaskManager?: ItemMembershipTaskManager;
  itemTaskManager: ItemTaskManager;
};

const build = async ({
  runner,
  itemDbService,
  itemMemberhipDbService,
  itemMembershipTaskManager,
  itemTaskManager,
}: props) => {
  const app = fastify({
    ajv: {
      customOptions: {
        // This allow routes that take array to correctly interpret single values as an array
        // https://github.com/fastify/fastify/blob/main/docs/Validation-and-Serialization.md
        coerceTypes: 'array',
      },
    },
  });
  app.addSchema(schemas);

  app.decorate('taskRunner', runner);
  app.decorate('items', {
    taskManager: itemTaskManager,
    dbService: itemDbService,
  });
  app.decorate('itemMemberships', {
    dbService: itemMemberhipDbService,
    taskManager: itemMembershipTaskManager,
  });
  await app.register(plugin);

  return app;
};
export default build;
