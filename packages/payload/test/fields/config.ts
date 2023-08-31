/* eslint-disable @typescript-eslint/ban-ts-comment */
import fs from 'fs'
import path from 'path'

import getFileByPath from '../../src/uploads/getFileByPath.js'
import { buildConfigWithDefaults } from '../buildConfigWithDefaults.js'
import { devUser } from '../credentials.js'
import ArrayFields, { arrayDoc } from './collections/Array/index.js'
import BlockFields, { blocksDoc } from './collections/Blocks/index.js'
import CodeFields, { codeDoc } from './collections/Code/index.js'
import CollapsibleFields, { collapsibleDoc } from './collections/Collapsible/index.js'
import ConditionalLogic, { conditionalLogicDoc } from './collections/ConditionalLogic/index.js'
import DateFields, { dateDoc } from './collections/Date/index.js'
import GroupFields, { groupDoc } from './collections/Group/index.js'
import IndexedFields from './collections/Indexed/index.js'
import JSONFields, { jsonDoc } from './collections/JSON/index.js'
import NumberFields, { numberDoc } from './collections/Number/index.js'
import PointFields, { pointDoc } from './collections/Point/index.js'
import RadioFields, { radiosDoc } from './collections/Radio/index.js'
import RelationshipFields from './collections/Relationship/index.js'
import RichTextFields, { richTextBulletsDoc, richTextDoc } from './collections/RichText/index.js'
import RowFields from './collections/Row/index.js'
import SelectFields, { selectsDoc } from './collections/Select/index.js'
import TabsFields, { tabsDoc } from './collections/Tabs/index.js'
import TextFields, { textDoc, textFieldsSlug } from './collections/Text/index.js'
import Uploads, { uploadsDoc } from './collections/Upload/index.js'
import Uploads2 from './collections/Upload2/index.js'
import Uploads3 from './collections/Uploads3/index.js'

const _dirname = path.dirname(new URL(import.meta.url).pathname)

export default buildConfigWithDefaults({
  admin: {
    webpack: (config) => ({
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config?.resolve?.alias,
          fs: path.resolve(_dirname, './mocks/emptyModule.js'),
        },
      },
    }),
  },
  collections: [
    {
      slug: 'users',
      auth: true,
      admin: {
        useAsTitle: 'email',
      },
      fields: [
        {
          name: 'canViewConditionalField',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    ArrayFields,
    BlockFields,
    CodeFields,
    CollapsibleFields,
    ConditionalLogic,
    DateFields,
    RadioFields,
    GroupFields,
    RowFields,
    IndexedFields,
    JSONFields,
    NumberFields,
    PointFields,
    RelationshipFields,
    RichTextFields,
    SelectFields,
    TabsFields,
    TextFields,
    Uploads,
    Uploads2,
    Uploads3,
  ],
  localization: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    fallback: true,
  },
  onInit: async (payload) => {
    await payload.create({
      collection: 'users',
      data: {
        email: devUser.email,
        password: devUser.password,
      },
    })

    const createdArrayDoc = await payload.create({ collection: 'array-fields', data: arrayDoc })
    await payload.create({ collection: 'collapsible-fields', data: collapsibleDoc })
    await payload.create({ collection: 'conditional-logic', data: conditionalLogicDoc })
    await payload.create({ collection: 'group-fields', data: groupDoc })
    await payload.create({ collection: 'select-fields', data: selectsDoc })
    await payload.create({ collection: 'radio-fields', data: radiosDoc })
    await payload.create({ collection: 'tabs-fields', data: tabsDoc })
    await payload.create({ collection: 'point-fields', data: pointDoc })
    await payload.create({ collection: 'date-fields', data: dateDoc })
    await payload.create({ collection: 'code-fields', data: codeDoc })
    await payload.create({ collection: 'json-fields', data: jsonDoc })

    const createdTextDoc = await payload.create({ collection: textFieldsSlug, data: textDoc })

    const uploadsDir = path.resolve(_dirname, './collections/Upload/uploads')

    if (fs.existsSync(uploadsDir))
      fs.readdirSync(uploadsDir).forEach((f) => fs.rmSync(`${uploadsDir}/${f}`))

    const pngPath = path.resolve(_dirname, './uploads/payload.png')
    const pngFile = await getFileByPath(pngPath)
    const createdPNGDoc = await payload.create({ collection: 'uploads', data: {}, file: pngFile })

    const jpgPath = path.resolve(_dirname, './collections/Upload/payload.jpg')
    const jpgFile = await getFileByPath(jpgPath)
    const createdJPGDoc = await payload.create({
      collection: 'uploads',
      data: {
        ...uploadsDoc,
        media: createdPNGDoc.id,
      },
      file: jpgFile,
    })

    const richTextDocWithRelId = JSON.parse(
      JSON.stringify(richTextDoc).replace(/\{\{ARRAY_DOC_ID\}\}/g, createdArrayDoc.id),
    )
    const richTextDocWithRelationship = { ...richTextDocWithRelId }

    const richTextRelationshipIndex = richTextDocWithRelationship.richText.findIndex(
      ({ type }) => type === 'relationship',
    )
    richTextDocWithRelationship.richText[richTextRelationshipIndex].value = {
      id: createdTextDoc.id,
    }
    richTextDocWithRelationship.richTextReadOnly[richTextRelationshipIndex].value = {
      id: createdTextDoc.id,
    }

    const richTextUploadIndex = richTextDocWithRelationship.richText.findIndex(
      ({ type }) => type === 'upload',
    )
    richTextDocWithRelationship.richText[richTextUploadIndex].value = { id: createdJPGDoc.id }
    richTextDocWithRelationship.richTextReadOnly[richTextUploadIndex].value = {
      id: createdJPGDoc.id,
    }

    await payload.create({ collection: 'rich-text-fields', data: richTextBulletsDoc })
    await payload.create({ collection: 'rich-text-fields', data: richTextDocWithRelationship })

    await payload.create({ collection: 'number-fields', data: numberDoc })

    const blocksDocWithRichText = { ...blocksDoc }

    // @ts-expect-error
    blocksDocWithRichText.blocks[0].richText = richTextDocWithRelationship.richText
    // @ts-expect-error
    blocksDocWithRichText.localizedBlocks[0].richText = richTextDocWithRelationship.richText

    await payload.create({ collection: 'block-fields', data: blocksDocWithRichText })
  },
})