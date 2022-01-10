import { ItemMembershipService, ItemService } from 'graasp';
import { ItemTaskManager, TaskRunner, ItemMembershipTaskManager } from 'graasp-test';
import MockTask from 'graasp-test/src/tasks/task';
import { StatusCodes } from 'http-status-codes';
import { v4 } from 'uuid';
import qs from 'qs';
import build from './app';
import { ITEM_TAGS, TAGS } from './constants';

const itemTaskManager = new ItemTaskManager();
const runner = new TaskRunner();
const itemDbService = {} as unknown as ItemService;
const itemMemberhipDbService = {} as unknown as ItemMembershipService;
const itemMembershipTaskManager = new ItemMembershipTaskManager();

describe('Tags', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(() => {
      return;
    });
    jest.spyOn(runner, 'setTaskPreHookHandler').mockImplementation(() => {
      return;
    });
  });

  describe('GET /tags/list', () => {
    it('Get tags', async () => {
      const app = await build({
        runner,
        itemDbService,
        itemMemberhipDbService,
        itemMembershipTaskManager,
        itemTaskManager,
      });

      jest.spyOn(runner, 'runSingle').mockImplementation(async () => TAGS);
      const res = await app.inject({
        method: 'GET',
        url: '/tags/list',
      });
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.json()).toEqual(TAGS);
    });
  });

  describe('GET /:itemId/tags', () => {
    it('Get tags of an item', async () => {
      const app = await build({
        runner,
        itemDbService,
        itemMemberhipDbService,
        itemMembershipTaskManager,
        itemTaskManager,
      });

      jest.spyOn(runner, 'runSingleSequence').mockImplementation(async () => ITEM_TAGS);
      jest.spyOn(itemTaskManager, 'createGetTaskSequence').mockReturnValue([new MockTask()]);
      const res = await app.inject({
        method: 'GET',
        url: `/${v4()}/tags`,
      });
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.json()).toEqual(ITEM_TAGS);
    });
    it('Bad request if item id is invalid', async () => {
      const app = await build({
        runner,
        itemDbService,
        itemMemberhipDbService,
        itemMembershipTaskManager,
        itemTaskManager,
      });

      const res = await app.inject({
        method: 'GET',
        url: '/invalid-id/tags',
      });
      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });
  });

  describe('GET /tags?id=<id>&id<id>', () => {
    it('Get tags for a single item', async () => {
      const app = await build({
        runner,
        itemDbService,
        itemMemberhipDbService,
        itemMembershipTaskManager,
        itemTaskManager,
      });

      jest.spyOn(runner, 'runMultipleSequences').mockImplementation(async () => [ ITEM_TAGS ]);
      jest.spyOn(itemTaskManager, 'createGetTaskSequence').mockReturnValue([new MockTask()]);
      const res = await app.inject({
        method: 'GET',
        url: `/tags?id=${v4()}`,
      });
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.json()).toEqual([ ITEM_TAGS ]);
    });

    it('Get tags for multiple items', async () => {

      const ids = [ v4(), v4() ];

      const app = await build({
        runner,
        itemDbService,
        itemMemberhipDbService,
        itemMembershipTaskManager,
        itemTaskManager,
      });

      jest.spyOn(runner, 'runMultipleSequences').mockImplementation(async () => [ ITEM_TAGS, ITEM_TAGS ]);
      jest.spyOn(itemTaskManager, 'createGetTaskSequence').mockReturnValue([new MockTask()]);
      const res = await app.inject({
        method: 'GET',
        url: `/tags?${qs.stringify({ id: ids }, { arrayFormat: 'repeat' })}`,
      });
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.json()).toEqual([ ITEM_TAGS, ITEM_TAGS ]);
    });

    it('Bad request if item id is invalid', async () => {
      const ids = [ 'invalid-id', v4() ];

      const app = await build({
        runner,
        itemDbService,
        itemMemberhipDbService,
        itemMembershipTaskManager,
        itemTaskManager,
      });

      const res = await app.inject({
        method: 'GET',
        url: `/tags?${qs.stringify({ id: ids }, { arrayFormat: 'repeat' })}`,
      });
      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });
  });

  describe('POST /:itemId/tags', () => {
    it('Create a tags for an item', async () => {
      const app = await build({
        runner,
        itemDbService,
        itemMemberhipDbService,
        itemMembershipTaskManager,
        itemTaskManager,
      });

      const result = ITEM_TAGS[0];
      jest.spyOn(runner, 'runSingle').mockImplementation(async () => result);
      const res = await app.inject({
        method: 'POST',
        url: `/${v4()}/tags`,
        payload: {
          tagId: v4(),
        },
      });
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.json()).toEqual(result);
    });
    it('Bad request if item id is invalid', async () => {
      const app = await build({
        runner,
        itemDbService,
        itemMemberhipDbService,
        itemMembershipTaskManager,
        itemTaskManager,
      });

      const res = await app.inject({
        method: 'POST',
        url: '/invalid-id/tags',
        payload: {
          tagId: 'invalid-id',
        },
      });
      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });
    it('Bad request if body is invalid', async () => {
      const app = await build({
        runner,
        itemDbService,
        itemMemberhipDbService,
        itemMembershipTaskManager,
        itemTaskManager,
      });

      const res = await app.inject({
        method: 'POST',
        url: `/${v4()}/tags`,
        payload: {
          tagId: 'invalid-id',
        },
      });
      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });
  });

  describe('DELETE /:itemId/tags/:id', () => {
    it('Delete a tag of an item', async () => {
      const app = await build({
        runner,
        itemDbService,
        itemMemberhipDbService,
        itemMembershipTaskManager,
        itemTaskManager,
      });

      const result = ITEM_TAGS[0];
      jest.spyOn(runner, 'runSingle').mockImplementation(async () => result);
      jest.spyOn(itemTaskManager, 'createGetTaskSequence').mockReturnValue([new MockTask()]);
      const res = await app.inject({
        method: 'DELETE',
        url: `/${v4()}/tags/${v4()}`,
      });
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.json()).toEqual(result);
    });
    it('Bad request if item id is invalid', async () => {
      const app = await build({
        runner,
        itemDbService,
        itemMemberhipDbService,
        itemMembershipTaskManager,
        itemTaskManager,
      });

      const res = await app.inject({
        method: 'DELETE',
        url: `/invalid-id/tags/${v4()}`,
      });
      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });
    it('Bad request if item tag id is invalid', async () => {
      const app = await build({
        runner,
        itemDbService,
        itemMemberhipDbService,
        itemMembershipTaskManager,
        itemTaskManager,
      });

      const res = await app.inject({
        method: 'DELETE',
        url: `/${v4()}/tags/invalid-id`,
      });
      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });
  });
});
