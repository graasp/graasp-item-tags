import { StatusCodes } from 'http-status-codes';

import { ErrorFactory } from '@graasp/sdk';

import { PLUGIN_NAME } from './constants';

export const GraaspError = ErrorFactory(PLUGIN_NAME);

export class ItemNotFound extends GraaspError {
  constructor(data?: unknown) {
    super(
      { code: 'GITERR001', statusCode: StatusCodes.NOT_FOUND, message: 'Item not found' },
      data,
    );
  }
}
export class MemberCannotReadItem extends GraaspError {
  constructor(data?: unknown) {
    super(
      { code: 'GITERR002', statusCode: StatusCodes.FORBIDDEN, message: 'Member cannot read item' },
      data,
    );
  }
}
export class MemberCannotAdminItem extends GraaspError {
  constructor(data?: unknown) {
    super(
      { code: 'GITERR003', statusCode: StatusCodes.FORBIDDEN, message: 'Member cannot admin item' },
      data,
    );
  }
}
export class ItemHasTag extends GraaspError {
  constructor(data?: unknown) {
    super(
      { code: 'GITERR004', statusCode: StatusCodes.BAD_REQUEST, message: 'Item already has tag' },
      data,
    );
  }
}
export class ItemTagNotFound extends GraaspError {
  constructor(data?: unknown) {
    super(
      { code: 'GITERR005', statusCode: StatusCodes.NOT_FOUND, message: 'Item tag not found' },
      data,
    );
  }
}
export class TagNotFound extends GraaspError {
  constructor(data?: unknown) {
    super({ code: 'GITERR006', statusCode: StatusCodes.NOT_FOUND, message: 'Tag not found' }, data);
  }
}
export class ConflictingTagsInTheHierarchy extends GraaspError {
  constructor(data?: unknown) {
    super(
      {
        code: 'GITERR007',
        statusCode: StatusCodes.FORBIDDEN,
        message: 'Tag already present in the hierarchy - ancestors or descendants',
      },
      data,
    );
  }
}
