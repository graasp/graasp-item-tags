// other services
import {
  Member,
  ItemService,
  ItemMembershipService,
  Actor,
  Task,
  Item,
  ItemTaskManager,
} from 'graasp';
// local
import { ItemTagService } from './db-service';
import { ItemTag } from './interfaces/item-tag';
import { CreateItemTagTask } from './tasks/create-item-tag-task';
import { DeleteItemTagTask } from './tasks/delete-item-tag-task';
import { BaseItemTagTask } from './tasks/base-item-tag-task';
import { GetItemsItemTagsTask } from './tasks/get-items-item-tags-task';
import { ItemTagTaskManager } from './interfaces/item-tag-task-manager';
import { GetAvailableTagsTask } from './tasks/get-available-tags-task';
import { DeleteItemTagsByItemIdTask } from './tasks/delete-item-tags-by-item-id-task';

export class TaskManager implements ItemTagTaskManager {
  private itemService: ItemService;
  private itemMembershipService: ItemMembershipService;
  private itemTagService: ItemTagService;
  private itemTaskManager: ItemTaskManager;

  constructor(
    itemService: ItemService,
    itemMembershipService: ItemMembershipService,
    itemTagService: ItemTagService,
    itemTaskManager: ItemTaskManager,
  ) {
    this.itemService = itemService;
    this.itemMembershipService = itemMembershipService;
    this.itemTagService = itemTagService;
    this.itemTaskManager = itemTaskManager;
  }

  getCreateTaskName(): string {
    return CreateItemTagTask.name;
  }
  getGetTaskName(): string {
    throw new Error('Method not implemented.');
  }
  getUpdateTaskName(): string {
    throw new Error('Method not implemented.');
  }
  getDeleteTaskName(): string {
    return DeleteItemTagTask.name;
  }

  getGetOfItemTaskName(): string {
    return GetItemsItemTagsTask.name;
  }
  getGetAvailableTagsName(): string {
    return GetAvailableTagsTask.name;
  }
  getDeleteItemTagsByItemIdTaskName(): string {
    return DeleteItemTagsByItemIdTask.name;
  }

  // CRUD
  createCreateTask(member: Member, data: Partial<ItemTag>, itemId: string): CreateItemTagTask {
    return new CreateItemTagTask(
      member,
      data,
      itemId,
      this.itemService,
      this.itemMembershipService,
      this.itemTagService,
    );
  }

  createGetTask(_member: Member, _objectId: string): BaseItemTagTask<Actor, ItemTag> {
    throw new Error('Method not implemented.');
  }

  createUpdateTask(
    _member: Member,
    _objectId: string,
    _data: Partial<ItemTag>,
  ): BaseItemTagTask<Actor, ItemTag> {
    throw new Error('Method not implemented.');
  }

  createDeleteTask(member: Member, id: string, itemId: string): DeleteItemTagTask {
    return new DeleteItemTagTask(
      member,
      id,
      itemId,
      this.itemService,
      this.itemMembershipService,
      this.itemTagService,
    );
  }

  createGetOfItemTask(member: Member, item: Item): GetItemsItemTagsTask {
    return new GetItemsItemTagsTask(
      member,
      this.itemService,
      this.itemMembershipService,
      this.itemTagService,
      { item },
    );
  }

  createGetOfItemTaskSequence(member: Member, itemId: string): Task<Actor, unknown>[] {
    const t1 = this.itemTaskManager.createGetTaskSequence(member, itemId);
    const t2 = new GetItemsItemTagsTask(
      member,
      this.itemService,
      this.itemMembershipService,
      this.itemTagService,
    );
    t2.getInput = () => ({ item: t1[0].result as Item });
    return [...t1, t2];
  }

  createGetAvailableTagsTask(member: Member): GetAvailableTagsTask {
    return new GetAvailableTagsTask(
      member,
      this.itemTagService,
      this.itemService,
      this.itemMembershipService,
    );
  }

  createDeleteItemTagsByItemIdTask(member: Member, itemId: string): DeleteItemTagsByItemIdTask {
    return new DeleteItemTagsByItemIdTask(
      member,
      itemId,
      this.itemService,
      this.itemMembershipService,
      this.itemTagService,
    );
  }
}
