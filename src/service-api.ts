// global
import { FastifyPluginAsync } from 'fastify';

import {
  IdParam, Item, IdsParams, ItemCopyHookHandlerExtraData,
  ItemMoveHookHandlerExtraData,
  PostHookHandlerType,
  PreHookHandlerType,
} from 'graasp';
// local
import common, {
  getItemTags,
  create,
  deleteOne,
  getTags,
  getMany
} from './schemas/schemas';
import { ItemTagService } from './db-service';
import { ItemTag } from './interfaces/item-tag';
import { ConflictingTagsInTheHierarchy } from './util/graasp-item-tags-error';
import { TaskManager } from './task-manager';

const plugin: FastifyPluginAsync = async (fastify) => {
  const {
    items: { dbService: iS, taskManager: itemTaskManager },
    itemMemberships: { dbService: iMS },
    taskRunner: runner,
  } = fastify;

  const iTS = new ItemTagService();
  const taskManager = new TaskManager(iS, iMS, iTS, itemTaskManager);

  // Move

  /**
   * Check if the item (and sub-tree) being moved has tags that conflict with the tags at the
   * destination item and its ancestors.
   * @param item Item being moved (item at the top of the tree)
   * @param _actor Actor/Member triggering the move task - <No used>
   * @param helpers `helpers.handler` Task's database transaction handler
   * @param extraData `extraData.destination` Item under which the `item` being moved will be placed
   */
  const checkForConflictingTagsOnMove: PreHookHandlerType<
    Item,
    ItemMoveHookHandlerExtraData
  > = async (item: Item, _actor, { handler }, { destination }) => {
    if (!destination) return;
    const conflictingTags = await iTS.haveConflictingTags(item.path, destination.path, handler);
    if (conflictingTags) throw new ConflictingTagsInTheHierarchy();
  };
  runner.setTaskPreHookHandler(itemTaskManager.getMoveTaskName(), checkForConflictingTagsOnMove);

  // Copy

  /**
   * Check if the item (and sub-tree) being copied has tags that conflict with the tags at the
   * destination item and ancestors.
   * @param copy Item copy (before being saved)
   * @param _actor Actor/Member triggering the copy task - <No used>
   * @param helpers `helpers.handler` Task's database transaction handler
   * @param extraData `extraData.original` Original item
   *
   * TODO: this is running for every subtask. Can it be improved?
   */
  const checkForConflictingTagsOnCopy: PreHookHandlerType<
    Item,
    ItemCopyHookHandlerExtraData
  > = async (copy: Item, _actor, { handler }, { original }) => {
    const { path: copyPath } = copy;
    const index = copyPath.lastIndexOf('.');
    const destinationPath = index === -1 ? null : copyPath.slice(0, index);

    if (!destinationPath) return; // copy will be placed under no item

    // if conflicting tags are found an error will be thrown on
    // the first copy subtask and stop the copy task for the whole tree.
    const conflictingTags = await iTS.haveConflictingTags(original.path, destinationPath, handler);
    if (conflictingTags) throw new ConflictingTagsInTheHierarchy();
  };
  runner.setTaskPreHookHandler(itemTaskManager.getCopyTaskName(), checkForConflictingTagsOnCopy);

  /**
   * Copy orignal item's tags to the item copy
   * @param copy Item copy (before being saved)
   * @param actor Actor/Member triggering the copy task
   * @param helpers `helpers.handler` Task's database transaction handler
   * @param extraData `extraData.original` Original item
   */
  const copyTagsFromOriginal: PostHookHandlerType<Item, ItemCopyHookHandlerExtraData> = async (
    copy: Item,
    actor,
    { handler },
    { original, shouldCopyTags = true },
  ) => {
    if (shouldCopyTags) {
      await iTS.copyTags(original, copy, actor.id, handler);
    }
  };
  runner.setTaskPostHookHandler(itemTaskManager.getCopyTaskName(), copyTagsFromOriginal);

  // schemas
  fastify.addSchema(common);

  // get available tags
  fastify.get(
    '/tags/list', { schema: getTags },
    async ({ member, log }) => {
      const task = taskManager.createGetAvailableTagsTask(member);
      return runner.runSingle(task, log);
    }
  );

  // get item tags
  fastify.get<{ Querystring: IdsParams }>(
    '/tags', { schema: getMany },
    async ({ member, query: { id: ids }, log }) => {
      const tasks = ids.map(id => taskManager.createGetOfItemTaskSequence(member, id));
      return runner.runMultipleSequences(tasks, log);
    }
  );

  // get item tags
  fastify.get<{ Params: { itemId: string } }>(
    '/:itemId/tags',
    { schema: getItemTags },
    async ({ member, params: { itemId }, log }) => {
      const tasks = taskManager.createGetOfItemTaskSequence(member, itemId);
      return runner.runSingleSequence(tasks, log);
    },
  );

  // create item tag
  fastify.post<{ Params: { itemId: string }; Body: Partial<ItemTag> }>(
    '/:itemId/tags',
    { schema: create },
    async ({ member, params: { itemId }, body, log }) => {
      const task = taskManager.createCreateTask(member, body, itemId);
      return runner.runSingle(task, log);
    },
  );

  // delete item tag
  fastify.delete<{ Params: { itemId: string } & IdParam }>(
    '/:itemId/tags/:id',
    { schema: deleteOne },
    async ({ member, params: { itemId, id }, log }) => {
      const task = taskManager.createDeleteTask(member, id, itemId);
      return runner.runSingle(task, log);
    },
  );
};

export default plugin;
