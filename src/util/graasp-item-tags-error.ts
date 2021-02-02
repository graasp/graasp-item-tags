import { GraaspErrorDetails, GraaspError } from 'graasp';

export class GraaspItemTagsError implements GraaspError {
  name: string;
  code: string
  message: string;
  statusCode?: number;
  data?: unknown;
  origin: 'core' | 'plugin';

  constructor({ code, statusCode, message }: GraaspErrorDetails, data?: unknown) {
    this.name = code;
    this.code = code;
    this.message = message;
    this.statusCode = statusCode;
    this.data = data;
    this.origin = 'plugin';
  }
}

export class ItemNotFound extends GraaspItemTagsError {
  constructor(data?: unknown) {
    super({ code: 'GITERR001', statusCode: 404, message: 'Item not found' }, data);
  }
}
export class UserCannotReadItem extends GraaspItemTagsError {
  constructor(data?: unknown) {
    super({ code: 'GITERR002', statusCode: 403, message: 'User cannot read item' }, data);
  }
}
export class UserCannotAdminItem extends GraaspItemTagsError {
  constructor(data?: unknown) {
    super({ code: 'GITERR003', statusCode: 403, message: 'User cannot admin item' }, data);
  }
}
export class ItemHasTag extends GraaspItemTagsError {
  constructor(data?: unknown) {
    super({ code: 'GITERR004', statusCode: 400, message: 'Item already has tag (own or inherited)' }, data);
  }
}
export class ItemTagNotFound extends GraaspItemTagsError {
  constructor(data?: unknown) {
    super({ code: 'GITERR005', statusCode: 404, message: 'Item tag not found' }, data);
  }
}
export class TagNotFound extends GraaspItemTagsError {
  constructor(data?: unknown) {
    super({ code: 'GITERR006', statusCode: 404, message: 'Tag not found' }, data);
  }
}
export class TagFoundLowerInTheHierarchy extends GraaspItemTagsError {
  constructor(data?: unknown) {
    super({ code: 'GITERR007', statusCode: 404, message: 'Tag is already present lower down in the hierarchy.' }, data);
  }
}
