// global
import { DatabaseTransactionHandler, ItemMembershipService, ItemService, Member } from 'graasp';
import { TAGS } from '../constants';
import { ItemTagService } from '../db-service';
import { BaseItemTagTask } from './base-item-tag-task';

export class DeleteItemTagsByItemIdTask extends BaseItemTagTask<Member, number> {
  get name(): string {
    return DeleteItemTagsByItemIdTask.name;
  }

  private itemId: string;

  constructor(
    member: Member,
    itemId: string,
    itemService: ItemService,
    itemMembershipService: ItemMembershipService,
    itemTagService: ItemTagService,
  ) {
    super(member, itemTagService, itemService, itemMembershipService);
    this.itemId = itemId;
  }

  async run(handler: DatabaseTransactionHandler): Promise<void> {
    this.status = 'RUNNING';
    const itemPath = this.itemId.replace(/-/g, '_');
    const tags = (await this.itemTagService.getAllTags(handler))?.filter((tag) => tag?.name === TAGS.PUBLIC || tag?.name === TAGS.PUBLISHED);
    const tagIds = tags?.map((tag) => tag?.id);
    this._result = await this.itemTagService.deleteItemTagsByItemId(itemPath, tagIds, handler);
    this.status = 'OK';
  }
}
