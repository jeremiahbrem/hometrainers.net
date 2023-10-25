import { ImageTextLeft } from "./image-text-left";
import { ImageTextRight } from "./image-rext-right";
import { FullPageImageTextLeft } from "./full-page-image-text-left";
import { FullPageImageTextRight } from "./full-page-image-text-right";
import { ContactForm } from "./contact-form";
import { IconTextList } from "./icon-text-list";
import { TwoColumnText } from "./two-column-text";
import { IconTextRow } from "./icon-text-row";
import { BlockHeader } from "./header";
import { BlockFooter } from "./footer";

export const Blocks = {
  'image-text-left': ImageTextLeft,
  'image-text-right': ImageTextRight,
  'full-page-image-text-left': FullPageImageTextLeft,
  'full-page-image-text-right': FullPageImageTextRight,
  'contact-form': ContactForm,
  'icon-text-list': IconTextList,
  'icon-text-row': IconTextRow,
  'two-column-text': TwoColumnText,
  'header': BlockHeader,
  'footer': BlockFooter,
}