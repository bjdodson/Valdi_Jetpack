export { Row, type RowProps } from "./layout/Row";
export { Column, type ColumnProps } from "./layout/Column";
export { Box, type BoxProps } from "./layout/Box";
export { Spacer, type SpacerProps } from "./layout/Spacer";
export { LazyRow, LazyColumn, type LazyListProps, type ContentPadding } from "./layout/LazyList";
export { Text, type TextProps } from "./foundation/Text";
export { Image, type ImageProps, type ContentScale } from "./foundation/Image";
export { Card, type CardProps } from "./foundation/Card";
export { type ComposeCorePlaceholder } from "./types/PlaceholderModel";

/**
 * Compose-style `remember` stub. The real implementation will delegate to
 * Valdi's state store once the runtime bridge is in place.
 */
export function remember<T>(factory: () => T): T {
  return factory();
}
