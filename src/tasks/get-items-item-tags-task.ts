// global
import { DatabaseTransactionHandler } from 'graasp';
// other services
import { Member, ItemService, ItemMembershipService } from 'graasp';
// local
import { ItemTagService } from '../db-service';
import { ItemTag } from '../interfaces/item-tag';
import { ItemNotFound, UserCannotReadItem } from '../util/graasp-item-tags-error';
import { BaseItemTagTask } from './base-item-tag-task';

export class GetItemsItemTagsTask extends BaseItemTagTask<ItemTag[]> {
  get name(): string { return GetItemsItemTagsTask.name; }

  constructor(member: Member, itemId: string,
    itemService: ItemService, itemMembershipService: ItemMembershipService,
    itemTagService: ItemTagService) {
    super(member, itemService, itemMembershipService, itemTagService);
    this.targetId = itemId;
  }

  async run(handler: DatabaseTransactionHandler): Promise<void> {
    this.status = 'RUNNING';

    // get item for which we're fetching its tags
    const item = await this.itemService.get(this.targetId, handler);
    if (!item) throw new ItemNotFound(this.targetId);

    // verify if member getting the tags has rights for that
    const hasRights = await this.itemMembershipService.canRead(this.actor, item, handler);
    if (!hasRights) throw new UserCannotReadItem(this.targetId);

    // get tags
    const itemTags = await this.itemTagService.getAll(item, handler);

    // return item tags
    this._result = itemTags;
    this.status = 'OK';
  }
}
