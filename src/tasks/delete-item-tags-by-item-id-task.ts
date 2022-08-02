import {
  DatabaseTransactionHandler,
  ItemMembershipService,
  ItemService,
  Member,
  TaskStatus,
} from '@graasp/sdk';

import { ItemTagService } from '../db-service';
import { BaseItemTagTask } from './base-item-tag-task';

export class DeleteItemTagsByItemIdTask extends BaseItemTagTask<Member, number> {
  get name(): string {
    return DeleteItemTagsByItemIdTask.name;
  }

  private itemId: string;
  private tagIds: string[];

  constructor(
    member: Member,
    itemId: string,
    tagIds: string[],
    itemService: ItemService,
    itemMembershipService: ItemMembershipService,
    itemTagService: ItemTagService,
  ) {
    super(member, itemTagService, itemService, itemMembershipService);
    this.itemId = itemId;
    this.tagIds = tagIds;
  }

  async run(handler: DatabaseTransactionHandler): Promise<void> {
    this.status = TaskStatus.RUNNING;
    const itemPath = this.itemId.replace(/-/g, '_');
    this._result = await this.itemTagService.deleteItemTagsByItemId(itemPath, this.tagIds, handler);
    this.status = TaskStatus.OK;
  }
}
