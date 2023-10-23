import React from 'react'
import styles from './iconTextRow.module.scss'
import { IconText, IconTextBaseProps } from '../icon-text'

export const IconTextRow: React.FC<IconTextBaseProps> = (props) => (
  <IconText {...{ ...props, styles }} />
)