// global
import { DatabaseTransactionHandler } from 'graasp';
// other services
import { Member } from 'graasp';
// local
import { ItemTagService } from '../db-service';
import { Tag } from '../interfaces/tag';
import { BaseItemTagTask } from './base-item-tag-task';

export class GetAvailableTagsTask extends BaseItemTagTask<readonly Tag[]> {
  get name(): string { return GetAvailableTagsTask.name; }

  constructor(member: Member, itemTagService: ItemTagService) {
    super(member, null, null, itemTagService);
  }

  async run(handler: DatabaseTransactionHandler): Promise<void> {
    this.status = 'RUNNING';

    // get available tags
    const tags = await this.itemTagService.getAllTags(handler);

    this._result = tags;
    this.status = 'OK';
  }
}
