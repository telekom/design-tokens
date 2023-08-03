const fs = require('fs-extra');
const { Client } = require('@notionhq/client');
const Papa = require('papaparse');

/*
  ## Usage
  1. Create integration in workspace (workspace-owner permissions required)
  2. Add Notion integration to page via Connections
  3. Get database id for "List of sources" database
  4. Set both the integration secret (token) and database id as environment variables (below)
*/

const INTEGRATION_SECRET = process.env.NOTION_TOKEN || 'secret_XXhiZjBRILpsvqg7xSoRFuSQ19EY0USla0uyJg0IHGu';
const LIST_OF_SOURCES_DATABASE_ID = process.env.NOTION_DATABASE_ID || 'fba0e85618c64891b38318e71f23b98b';
const PAGE_EMOJI = '💾';
const TEST_LIMIT = undefined;

const Tier_select_opts = [
  { name: 'Core', color: 'default' },
  { name: 'Semantic', color: 'pink' },
];
const Category_select_opts = [
  { name: 'Color', color: 'green' },
  { name: 'Line Weight', color: 'orange' },
  { name: 'Motion', color: 'brown' },
  { name: 'Opacity', color: 'default' },
  { name: 'Radius', color: 'yellow' },
  { name: 'Shadow', color: 'blue' },
  { name: 'Dimension', color: 'default' },
  { name: 'Spacing', color: 'gray' },
  { name: 'Size', color: 'gray' },
  { name: 'Text Style', color: 'purple' },
  { name: 'Typography', color: 'red' },
];
const Type_select_opts = [
  { name: 'percentage', color: 'default' },
  { name: 'font', color: 'default' },
  { name: 'textStyle', color: 'default' },
  { name: 'shadow', color: 'default' },
  { name: 'number', color: 'default' },
  { name: 'cubic-bezier', color: 'default' },
  { name: 'time', color: 'default' },
  { name: 'dimension', color: 'default' },
  { name: 'modular-scale', color: 'default' },
  { name: 'color', color: 'default' },
];

const source_database_props = {
  Category: {
    select: { options: Category_select_opts },
  },
  Value: {
    rich_text: {},
  },
  Type: {
    select: { options: Type_select_opts },
  },
  Description: {
    rich_text: {},
  },
  'Value (dark)': {
    rich_text: {},
  },
  'Is Alias?': {
    checkbox: {},
  },
  Tier: {
    select: { options: Tier_select_opts },
  },
  Name: { title: {} },
};

const notion = new Client({
  auth: INTEGRATION_SECRET,
});

main();

/*
  - read and parse CSV data
  - create select opts for Category, Type, and Tier (above)
  - create new page in list of sources database
  - add tokens database to the new page
  - create a page for each token in the tokens database (1 per second to avoid rate limit)
    https://developers.notion.com/reference/request-limits
    > average of three requests per second
*/
async function main() {
  const data = await fs.readFile('dist/csv/design-tokens.all.csv', 'utf8');

  console.log('Setting up database...');

  // Create new page in list of sources database
  const res_source_page = await create_source_page(
    'Source ' + new Date().toISOString().slice(0, 10)
  );

  // Add tokens database to the new page
  const res_tokens_database = await create_tokens_database(res_source_page.id);

  // TODO handle errors
  const csv_data = Papa.parse(data, { header: true });
  const tokens =
    TEST_LIMIT != null
      ? csv_data.data.slice(0, TEST_LIMIT)
      : [...csv_data.data];
  const result = [];

  // Insert data into tokens database
  async function insert_data() {
    if (tokens.length === 0) return;
    const next = tokens.pop();
    const res = await create_token_page(res_tokens_database.id, next);
    result.push(res);
    console.log('Created page', res.id);
    await sleep(1000);
    return insert_data();
  }

  console.log(`Adding ${tokens.length} pages...`);
  await insert_data();
  console.log('Done');
}

function create_token_page(parent_id, next) {
  return notion.pages.create({
    parent: {
      type: 'database_id',
      database_id: parent_id,
    },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: next.Name,
            },
          },
        ],
      },
      Tier: {
        select: {
          name: next.Tier,
        },
      },
      Category: {
        select: {
          name: next.Category,
        },
      },
      Type: {
        select: {
          name: next.Type,
        },
      },
      Value: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: next.Value,
              link: null,
            },
          },
        ],
      },
      'Value (dark)': {
        rich_text: [
          {
            type: 'text',
            text: {
              content: next['Value (dark)'],
              link: null,
            },
          },
        ],
      },
      Description: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: next.Description,
              link: null,
            },
          },
        ],
      },
      'Is Alias?': {
        checkbox: next['Is Alias?'] === 'Yes',
      },
    },
  });
}

function create_source_page(title) {
  return notion.pages.create({
    icon: {
      type: 'emoji',
      emoji: PAGE_EMOJI,
    },
    parent: {
      type: 'database_id',
      database_id: LIST_OF_SOURCES_DATABASE_ID,
    },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      },
    },
  });
}

function create_tokens_database(parent_page_id) {
  return notion.databases.create({
    parent: {
      type: 'page_id',
      page_id: parent_page_id,
    },
    title: [
      {
        type: 'text',
        text: { content: 'Tokens database' },
        plain_text: 'Tokens database',
      },
    ],
    properties: source_database_props,
    is_inline: true,
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
