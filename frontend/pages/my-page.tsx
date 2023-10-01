import React from 'react'
import { MyPageComponent } from '@/components/my-page';
import { Blocks } from '@/components/blocks';
import { PreviewBlocks } from '@/components/block-selector/previewBlocks';

export default function MyPage() {
  return <MyPageComponent Blocks={Blocks} PreviewBlocks={PreviewBlocks}/>
}