// global
import { Actor, DatabaseTransactionHandler, Item } from 'graasp';
// other services
import { ItemService, ItemMembershipService } from 'graasp';
// local
import { ItemTagService } from '../db-service';
import { ItemTag } from '../interfaces/item-tag';
import { BaseItemTagTask } from './base-item-tag-task';

type InputType = {
  item?: Item
}

export class GetItemsItemTagsTask extends BaseItemTagTask<Actor, ItemTag[]> {
  get name(): string {
    return GetItemsItemTagsTask.name;
  }

  input: InputType
  getInput: () => InputType

  constructor(
    member: Actor,
    itemService: ItemService,
    itemMembershipService: ItemMembershipService,
    itemTagService: ItemTagService,
    input?: InputType
  ) {
    super(member, itemTagService, itemService, itemMembershipService);
    this.input = input
  }

  async run(handler: DatabaseTransactionHandler): Promise<void> {
    this.status = 'RUNNING';

    const { item } = this.input
    this.targetId = item?.id

    // get tags
    const itemTags = await this.itemTagService.getAll(item, handler);

    // return item tags
    this._result = itemTags;
    this.status = 'OK';
  }
}
