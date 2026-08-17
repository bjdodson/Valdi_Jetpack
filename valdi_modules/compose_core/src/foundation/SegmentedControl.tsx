import { Component } from "valdi_core/src/Component";
import { systemBoldFont } from "valdi_core/src/SystemFont";
import { CSSValue } from "valdi_tsx/src/NativeTemplateElements";

import { ComposeControlTheme, resolveComposeControlTheme } from "./ControlTheme";

export interface SegmentedControlOption {
  value: string;
  label: string;
  disabled?: boolean;
  accessibilityLabel?: string;
  testTag?: string;
}

export interface SegmentedControlProps {
  options: readonly SegmentedControlOption[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  width?: CSSValue;
  theme?: Partial<ComposeControlTheme>;
  activeColor?: string;
  inactiveColor?: string;
  activeTextColor?: string;
  inactiveTextColor?: string;
  disabledColor?: string;
  testTag?: string;
  accessibilityLabel?: string;
}

/** Returns the selected option index, or -1 when the controlled value is absent. */
export function selectedSegmentIndex(
  options: readonly SegmentedControlOption[],
  value: string,
): number {
  return options.findIndex(option => option.value === value);
}

/** Resolves a segment press without changing disabled or already-selected values. */
export function nextSegmentValue(
  currentValue: string,
  option: SegmentedControlOption,
  disabled = false,
): string {
  return disabled || option.disabled ? currentValue : option.value;
}

/**
 * A controlled single-selection control.
 *
 * Valdi 0.1.1 exposes tap and radio accessibility state, but not a portable
 * focus model or arrow-key event surface. Keyboard roving selection
 * is therefore intentionally deferred rather than simulated inconsistently.
 */
export class SegmentedControl extends Component<SegmentedControlProps> {
  onRender(): void {
    const {
      options,
      value,
      disabled = false,
      width = "100%",
      theme: themeOverrides,
      testTag,
      accessibilityLabel = "Options",
    } = this.viewModel;
    const theme = resolveComposeControlTheme(themeOverrides);
    const inactiveColor = this.viewModel.inactiveColor ?? theme.surfaceMuted;

    <view
      width={width}
      minHeight={40}
      flexDirection="row"
      alignItems="stretch"
      padding={3}
      borderRadius={10}
      backgroundColor={disabled ? theme.surfaceDisabled : inactiveColor}
      accessibilityId={testTag}
      accessibilityLabel={accessibilityLabel}
      accessibilityNavigation="group"
    >
      {options.forEach((option, index) => this.renderOption(option, index, value, disabled, theme))}
    </view>;
  }

  private renderOption(
    option: SegmentedControlOption,
    index: number,
    currentValue: string,
    controlDisabled: boolean,
    theme: ComposeControlTheme,
  ): void {
    const activeColor = this.viewModel.activeColor ?? theme.surfaceSelected;
    const activeTextColor = this.viewModel.activeTextColor ?? theme.text;
    const inactiveTextColor = this.viewModel.inactiveTextColor ?? theme.textMuted;
    const disabledColor = this.viewModel.disabledColor ?? theme.textDisabled;
    const selected = option.value === currentValue;
    const disabled = controlDisabled || option.disabled === true;
    const segmentTestTag = option.testTag ?? (this.viewModel.testTag ? `${this.viewModel.testTag}_${option.value}` : undefined);

    <view
      minHeight={34}
      flexGrow={1}
      flexBasis={0}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      padding="8 10"
      marginLeft={index === 0 ? 0 : 3}
      borderRadius={8}
      backgroundColor={selected ? (disabled ? theme.surfaceDisabled : activeColor) : "transparent"}
      accessibilityId={segmentTestTag}
      accessibilityLabel={option.accessibilityLabel ?? option.label}
      accessibilityCategory="radio"
      accessibilityNavigation="leaf"
      accessibilityStateSelected={selected}
      accessibilityStateDisabled={disabled}
      touchEnabled={!disabled}
      onTap={disabled ? undefined : () => this.handleOptionPress(option)}
    >
      <label
        value={option.label}
        color={disabled ? disabledColor : selected ? activeTextColor : inactiveTextColor}
        font={systemBoldFont(12)}
        textAlign="center"
        numberOfLines={1}
      />
    </view>;
  }

  private handleOptionPress(option: SegmentedControlOption): void {
    const nextValue = nextSegmentValue(this.viewModel.value, option, this.viewModel.disabled);
    if (nextValue !== this.viewModel.value) {
      this.viewModel.onValueChange(nextValue);
    }
  }
}
