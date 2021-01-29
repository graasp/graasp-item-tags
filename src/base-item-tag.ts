// local
import { ItemTag } from './interfaces/item-tag';

export class BaseItemTag implements ItemTag {
  id: string;
  readonly tagId: string;
  readonly itemPath: string;
  readonly creator: string;
  createdAt: string;

  constructor(tagId: string, itemPath: string, creator: string) {
    this.tagId = tagId;
    this.itemPath = itemPath;
    this.creator = creator;
  }
}
