import React from 'react'
import styles from './iconTextList.module.scss'
import { IconText, IconTextBaseProps } from '../icon-text'

export const IconTextList: React.FC<IconTextBaseProps> = (props) => (
  <IconText {...{ ...props, styles }} />
)