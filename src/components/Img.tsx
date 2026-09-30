import type { ImgHTMLAttributes } from 'react'
import { IMAGES, type ImageKey } from '../lib/images'

type Props = { k: ImageKey } & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'>

export function Img({ k, alt = '', ...rest }: Props) {
  return <img src={IMAGES[k]} alt={alt} decoding="async" {...rest} />
}
