import { Component } from "valdi_core/src/Component";
import { Style } from "valdi_core/src/Style";
import { CSSValue, ImageObjectFit, ImageView, Layout, View } from "valdi_tsx/src/NativeTemplateElements";

export type ContentScale = ImageObjectFit;

export interface ImageProps {
  source?: string;
  contentDescription?: string;
  contentScale?: ContentScale;
  tint?: string;
  flipOnRtl?: boolean;
  width?: CSSValue;
  height?: CSSValue;
  accessibilityLabel?: string;
  testTag?: string;
  style?: Style<ImageView | View | Layout>;
}

/**
 * Compose-style image wrapper around Valdi's <image/> element.
 */
export class Image extends Component<ImageProps> {
  onRender(): void {
    const {
      source,
      contentDescription,
      contentScale = "contain",
      tint,
      flipOnRtl,
      width,
      height,
      accessibilityLabel,
      testTag,
      style,
    } = this.viewModel ?? {};

    <image
      src={source}
      objectFit={contentScale}
      tint={tint}
      flipOnRtl={flipOnRtl}
      width={width}
      height={height}
      accessibilityLabel={accessibilityLabel ?? contentDescription}
      accessibilityId={testTag}
      style={style}
    />;
  }
}
