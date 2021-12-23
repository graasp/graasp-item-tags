// global
import { DatabaseTransactionHandler, ItemMembershipService, ItemService } from 'graasp';
// other services
import { Actor } from 'graasp';
// local
import { ItemTagService } from '../db-service';
import { Tag } from '../interfaces/tag';
import { BaseItemTagTask } from './base-item-tag-task';

export class GetAvailableTagsTask extends BaseItemTagTask<Actor, readonly Tag[]> {
  get name(): string {
    return GetAvailableTagsTask.name;
  }

  constructor(
    member: Actor,
    itemTagService: ItemTagService,
    itemService: ItemService,
    itemMembershipService: ItemMembershipService,
  ) {
    super(member, itemTagService, itemService, itemMembershipService);
  }

  async run(handler: DatabaseTransactionHandler): Promise<void> {
    this.status = 'RUNNING';

    // get available tags
    const tags = await this.itemTagService.getAllTags(handler);

    this._result = tags;
    this.status = 'OK';
  }
}
