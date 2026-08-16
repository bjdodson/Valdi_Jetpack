import { Component } from "valdi_core/src/Component";
import { systemBoldFont, systemFont } from "valdi_core/src/SystemFont";
import { CSSValue } from "valdi_tsx/src/NativeTemplateElements";

import { ComposeControlTheme, resolveComposeControlTheme } from "./ControlTheme";

export interface ToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  supportingText?: string;
  disabled?: boolean;
  width?: CSSValue;
  theme?: Partial<ComposeControlTheme>;
  activeColor?: string;
  inactiveColor?: string;
  thumbColor?: string;
  labelColor?: string;
  supportingTextColor?: string;
  testTag?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export type SwitchProps = ToggleProps;

/** Resolves the next controlled value while preserving disabled toggles. */
export function nextToggleValue(checked: boolean, disabled = false): boolean {
  return disabled ? checked : !checked;
}

/**
 * A controlled boolean input with explicit checkbox semantics.
 *
 * Pinned Valdi has no distinct switch accessibility category or portable
 * keyboard/focus callbacks. The control uses the supported checkbox category,
 * selected/disabled states, and native accessibility activation.
 */
export class Toggle extends Component<ToggleProps> {
  onRender(): void {
    const {
      checked,
      label,
      supportingText,
      disabled = false,
      width,
      theme: themeOverrides,
      testTag,
      accessibilityLabel,
      accessibilityHint,
    } = this.viewModel;
    const theme = resolveComposeControlTheme(themeOverrides);
    const activeColor = this.viewModel.activeColor ?? theme.accent;
    const inactiveColor = this.viewModel.inactiveColor ?? theme.borderStrong;
    const thumbColor = this.viewModel.thumbColor ?? theme.thumb;
    const labelColor = this.viewModel.labelColor ?? theme.text;
    const supportingTextColor = this.viewModel.supportingTextColor ?? theme.textMuted;
    const hasCopy = label !== undefined || supportingText !== undefined;
    const resolvedTrackColor = disabled ? theme.borderDisabled : checked ? activeColor : inactiveColor;
    const resolvedThumbColor = disabled ? theme.textDisabled : thumbColor;

    <view
      width={width}
      minHeight={44}
      flexDirection="row"
      alignItems="center"
      justifyContent={hasCopy ? "space-between" : "flex-start"}
      accessibilityId={testTag}
      accessibilityLabel={accessibilityLabel ?? label ?? "Toggle"}
      accessibilityHint={accessibilityHint}
      accessibilityValue={checked ? "On" : "Off"}
      accessibilityCategory="checkbox"
      accessibilityNavigation="leaf"
      accessibilityStateSelected={checked}
      accessibilityStateDisabled={disabled}
      touchEnabled={!disabled}
      onTap={disabled ? undefined : this.handleTap}
    >
      {hasCopy ? (
        <view flexGrow={1} flexShrink={1} flexDirection="column" marginRight={12}>
          {label !== undefined ? (
            <label
              value={label}
              color={disabled ? theme.textDisabled : labelColor}
              font={systemBoldFont(12)}
              numberOfLines={0}
            />
          ) : undefined}
          {supportingText !== undefined ? (
            <label
              value={supportingText}
              color={disabled ? theme.textDisabled : supportingTextColor}
              font={systemFont(10)}
              numberOfLines={0}
              marginTop={label !== undefined ? 3 : 0}
            />
          ) : undefined}
        </view>
      ) : undefined}
      <view
        width={44}
        height={26}
        flexDirection="column"
        alignItems={checked ? "flex-end" : "flex-start"}
        justifyContent="center"
        padding={3}
        borderRadius={999}
        backgroundColor={resolvedTrackColor}
      >
        <view
          width={20}
          height={20}
          borderRadius={999}
          backgroundColor={resolvedThumbColor}
          boxShadow={`0 1 4 ${theme.shadow}`}
        />
      </view>
    </view>;
  }

  private handleTap = (): void => {
    const nextValue = nextToggleValue(this.viewModel.checked, this.viewModel.disabled);
    if (nextValue !== this.viewModel.checked) {
      this.viewModel.onCheckedChange(nextValue);
    }
  };
}

export { Toggle as Switch };
