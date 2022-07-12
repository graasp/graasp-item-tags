const MAX_ITEMS_FOR_GET = 30;

export default {
  $id: 'http://graasp.org/item-tags/',
  definitions: {
    itemIdParam: {
      type: 'object',
      required: ['itemId'],
      properties: {
        itemId: { $ref: 'http://graasp.org/#/definitions/uuid' },
      },
    },

    idParam: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { $ref: 'http://graasp.org/#/definitions/uuid' },
      },
    },

    // item tag properties to be returned to the client
    itemTag: {
      type: 'object',
      properties: {
        id: { $ref: 'http://graasp.org/#/definitions/uuid' },
        tagId: { $ref: 'http://graasp.org/#/definitions/uuid' },
        /**
         * itemPath's 'pattern' not supported in serialization.
         * since 'itemTag' schema is only used for serialization it's safe
         * to just use `{ type: 'string' }`
         */
        // itemPath: { $ref: 'http://graasp.org/#/definitions/itemPath' },
        itemPath: { type: 'string' },
        creator: { $ref: 'http://graasp.org/#/definitions/uuid' },
        createdAt: { type: 'string' },
      },
      additionalProperties: false,
    },

    // item tag properties required at creation
    createPartialItemTag: {
      type: 'object',
      required: ['tagId'],
      properties: {
        tagId: { $ref: 'http://graasp.org/#/definitions/uuid' },
      },
      additionalProperties: false,
    },

    // tag
    tag: {
      type: 'object',
      properties: {
        id: { $ref: 'http://graasp.org/#/definitions/uuid' },
        name: { type: 'string' },
        nested: { type: 'string' },
        createdAt: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
};

// schema for creating an item tag
const create = {
  params: { $ref: 'http://graasp.org/item-tags/#/definitions/itemIdParam' },
  body: { $ref: 'http://graasp.org/item-tags/#/definitions/createPartialItemTag' },
  response: {
    201: { $ref: 'http://graasp.org/item-tags/#/definitions/itemTag' },
  },
};

// schema for getting an item's tags
const getItemTags = {
  params: { $ref: 'http://graasp.org/item-tags/#/definitions/itemIdParam' },
  response: {
    200: {
      type: 'array',
      items: { $ref: 'http://graasp.org/item-tags/#/definitions/itemTag' },
    },
  },
};

const getMany = {
  querystring: {
    allOf: [
      { $ref: 'http://graasp.org/#/definitions/idsQuery' },
      { properties: { id: { maxItems: MAX_ITEMS_FOR_GET } } },
    ],
  },
  response: {
    200: {
      type: 'array',
      items: {
        type: 'array',
        items: { $ref: 'http://graasp.org/item-tags/#/definitions/itemTag' },
      },
    },
  },
};

// schema for deleting an item tag
const deleteOne = {
  params: {
    allOf: [
      { $ref: 'http://graasp.org/item-tags/#/definitions/itemIdParam' },
      { $ref: 'http://graasp.org/item-tags/#/definitions/idParam' },
    ],
  },
  response: {
    200: { $ref: 'http://graasp.org/item-tags/#/definitions/itemTag' },
  },
};

// schema for getting available tags
const getTags = {
  response: {
    200: {
      type: 'array',
      items: { $ref: 'http://graasp.org/item-tags/#/definitions/tag' },
    },
  },
};

export { getItemTags, create, deleteOne, getTags, getMany };
