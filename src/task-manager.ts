// other services
import { Member, ItemService, ItemMembershipService } from 'graasp';
// local
import { ItemTagService } from './db-service';
import { ItemTag } from './interfaces/item-tag';
import { CreateItemTagTask } from './tasks/create-item-tag-task';
import { DeleteItemTagTask } from './tasks/delete-item-tag-task';
import { BaseItemTagTask } from './tasks/base-item-tag-task';
import { GetItemsItemTagsTask } from './tasks/get-items-item-tags-task';
import { ItemTagTaskManager } from './interfaces/item-tag-task-manager';
import { GetAvailableTagsTask } from './tasks/get-available-tags-task';

export class TaskManager implements ItemTagTaskManager {
  private itemService: ItemService;
  private itemMembershipService: ItemMembershipService;
  private itemTagService: ItemTagService;

  constructor(
    itemService: ItemService, itemMembershipService: ItemMembershipService,
    itemTagService: ItemTagService,
  ) {
    this.itemService = itemService;
    this.itemMembershipService = itemMembershipService;
    this.itemTagService = itemTagService;
  }

  getCreateTaskName(): string { return CreateItemTagTask.name; }
  getGetTaskName(): string { throw new Error('Method not implemented.'); }
  getUpdateTaskName(): string { throw new Error('Method not implemented.'); }
  getDeleteTaskName(): string { return DeleteItemTagTask.name; }

  getGetOfItemTaskName(): string { return GetItemsItemTagsTask.name; }
  getGetAvailableTagsName(): string { return GetAvailableTagsTask.name; }

  // CRUD
  createCreateTask(member: Member, data: Partial<ItemTag>, itemId: string): CreateItemTagTask {
    return new CreateItemTagTask(member, data, itemId,
      this.itemService, this.itemMembershipService, this.itemTagService);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createGetTask(member: Member, objectId: string): BaseItemTagTask<ItemTag> {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createUpdateTask(member: Member, objectId: string, data: Partial<ItemTag>): BaseItemTagTask<ItemTag> {
    throw new Error('Method not implemented.');
  }

  createDeleteTask(member: Member, id: string, itemId: string): DeleteItemTagTask {
    return new DeleteItemTagTask(member, id, itemId,
      this.itemService, this.itemMembershipService, this.itemTagService);
  }

  // Other
  createGetOfItemTask(member: Member, itemId: string): GetItemsItemTagsTask {
    return new GetItemsItemTagsTask(member, itemId,
      this.itemService, this.itemMembershipService, this.itemTagService);
  }

  createGetAvailableTagsTask(member: Member): GetAvailableTagsTask {
    return new GetAvailableTagsTask(member, this.itemTagService);
  }
}
