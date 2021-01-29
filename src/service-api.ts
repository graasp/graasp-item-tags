// global
import { FastifyPluginAsync } from 'fastify';
import { IdParam } from 'graasp';
// local
import common, {
  getItemTags,
  create,
  deleteOne
} from './schemas';
import { ItemTagService } from './db-service';
import { ItemTagTaskManager } from './task-manager';
import { ItemTag } from './interfaces/item-tag';

declare module 'fastify' {
  interface FastifyInstance {
    itemTagService: ItemTagService;
  }
}

const plugin: FastifyPluginAsync = async (fastify) => {
  const {
    itemService: iS, itemMembershipService: iMS,
    taskRunner: runner
  } = fastify;

  const iTS = new ItemTagService();
  const taskManager = new ItemTagTaskManager(iS, iMS, iTS);

  // schemas
  fastify.addSchema(common);

  // // get item tags
  fastify.get<{ Params: { itemId: string } }>(
    '/:itemId/tags', { schema: getItemTags },
    async ({ member, params: { itemId }, log }) => {
      const task = taskManager.createGetItemsItemTagsTask(member, itemId);
      return runner.run([task], log);
    }
  );

  // create item tag
  fastify.post<{ Params: { itemId: string }; Body: Partial<ItemTag> }>(
    '/:itemId/tags', { schema: create },
    async ({ member, params: { itemId }, body, log }) => {
      const task = taskManager.createCreateTask(member, body, itemId);
      return runner.run([task], log);
    }
  );

  // delete item tag
  fastify.delete<{ Params: { itemId: string } & IdParam }>(
    '/:itemId/tags/:id', { schema: deleteOne },
    async ({ member, params: { itemId, id }, log }) => {
      const task = taskManager.createDeleteTask(member, id, itemId);
      return runner.run([task], log);
    }
  );
};

export default plugin;
