import * as facelessui from '@faceless-ui/modal'
const { useModal } = facelessui
import React from 'react'

import type { Block, Labels } from '../../../../../fields/config/types.js'

import { ArrayAction } from '../../../elements/ArrayAction/index.js'
import { useDrawerSlug } from '../../../elements/Drawer/useDrawerSlug.js'
import { BlocksDrawer } from './BlocksDrawer/index.js'

export const RowActions: React.FC<{
  addRow: (rowIndex: number, blockType: string) => void
  blockType: string
  blocks: Block[]
  duplicateRow: (rowIndex: number, blockType: string) => void
  hasMaxRows?: boolean
  labels: Labels
  moveRow: (fromIndex: number, toIndex: number) => void
  removeRow: (rowIndex: number) => void
  rowCount: number
  rowIndex: number
}> = (props) => {
  const {
    addRow,
    blockType,
    blocks,
    duplicateRow,
    hasMaxRows,
    labels,
    moveRow,
    removeRow,
    rowCount,
    rowIndex,
  } = props

  const { closeModal, openModal } = useModal()
  const drawerSlug = useDrawerSlug('blocks-drawer')

  const [indexToAdd, setIndexToAdd] = React.useState<null | number>(null)

  return (
    <React.Fragment>
      <BlocksDrawer
        addRow={(_, rowBlockType) => {
          if (typeof addRow === 'function') {
            addRow(indexToAdd, rowBlockType)
          }
          closeModal(drawerSlug)
        }}
        addRowIndex={rowIndex}
        blocks={blocks}
        drawerSlug={drawerSlug}
        labels={labels}
      />
      <ArrayAction
        addRow={(index) => {
          setIndexToAdd(index)
          openModal(drawerSlug)
        }}
        duplicateRow={() => duplicateRow(rowIndex, blockType)}
        hasMaxRows={hasMaxRows}
        index={rowIndex}
        moveRow={moveRow}
        removeRow={removeRow}
        rowCount={rowCount}
      />
    </React.Fragment>
  )
}