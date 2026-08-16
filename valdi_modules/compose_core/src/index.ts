export { Row, type RowProps } from "./layout/Row";
export { Column, type ColumnProps } from "./layout/Column";
export { Box, type BoxProps } from "./layout/Box";
export { Spacer, type SpacerProps } from "./layout/Spacer";
export { LazyRow, LazyColumn, type LazyListProps, type ContentPadding } from "./layout/LazyList";
export { Text, type TextProps, textLineHeightRatio } from "./foundation/Text";
export { Image, type ImageProps, type ContentScale } from "./foundation/Image";
export { Card, type CardProps } from "./foundation/Card";
export {
  defaultComposeControlTheme,
  mergeDefinedOverrides,
  resolveComposeControlTheme,
  type ComposeControlTheme,
} from "./foundation/ControlTheme";
export {
  Button,
  buttonPressEnabled,
  resolveButtonColors,
  type ButtonColors,
  type ButtonProps,
  type ButtonTone,
} from "./foundation/Button";
export {
  Slider,
  clampSliderValue,
  sliderFraction,
  sliderInteractionEnabled,
  sliderValueFromPosition,
  type SliderProps,
} from "./foundation/Slider";
export {
  SegmentedControl,
  nextSegmentValue,
  selectedSegmentIndex,
  type SegmentedControlOption,
  type SegmentedControlProps,
} from "./foundation/SegmentedControl";
export {
  Toggle,
  Switch,
  nextToggleValue,
  type SwitchProps,
  type ToggleProps,
} from "./foundation/Toggle";
export {
  Select,
  nextSelectValue,
  resolveSelectColors,
  selectAccessibilityHint,
  selectCanExpand,
  selectedSelectOption,
  type SelectColors,
  type SelectOption,
  type SelectProps,
} from "./foundation/Select";
export {
  TabBar,
  nextTabValue,
  selectedTabIndex,
  type TabBarOption,
  type TabBarProps,
} from "./foundation/TabBar";
export {
  TextField,
  nextTextFieldValue,
  resolveTextFieldColors,
  textFieldSubmissionValue,
  type TextFieldColors,
  type TextFieldProps,
} from "./foundation/TextField";
export { type ComposeCorePlaceholder } from "./types/PlaceholderModel";

/**
 * Compose-style `remember` stub. The real implementation will delegate to
 * Valdi's state store once the runtime bridge is in place.
 */
export function remember<T>(factory: () => T): T {
  return factory();
}
