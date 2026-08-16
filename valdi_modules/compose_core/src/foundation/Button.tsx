import { Component } from "valdi_core/src/Component";
import { Style } from "valdi_core/src/Style";
import { systemBoldFont } from "valdi_core/src/SystemFont";
import { CSSValue, Layout, View } from "valdi_tsx/src/NativeTemplateElements";

import { toStyle } from "../layout/types";
import { ComposeControlTheme, mergeDefinedOverrides, resolveComposeControlTheme } from "./ControlTheme";

export type ButtonTone = "primary" | "secondary" | "danger";

export interface ButtonColors {
  background: string;
  border: string;
  text: string;
}

export interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: ButtonTone;
  theme?: Partial<ComposeControlTheme>;
  colors?: Partial<ButtonColors>;
  width?: CSSValue;
  testTag?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: Style<View | Layout> | Partial<View & Layout>;
}

/** True when a button is allowed to dispatch its action. */
export function buttonPressEnabled(disabled = false): boolean {
  return !disabled;
}

/** Deterministically resolves semantic tone and disabled colors. */
export function resolveButtonColors(
  tone: ButtonTone = "primary",
  disabled = false,
  themeOverrides?: Partial<ComposeControlTheme>,
  overrides?: Partial<ButtonColors>,
): ButtonColors {
  const theme = resolveComposeControlTheme(themeOverrides);
  const colors = disabled
    ? { background: theme.surfaceDisabled, border: theme.borderDisabled, text: theme.textDisabled }
    : tone === "danger"
    ? { background: theme.dangerMuted, border: theme.danger, text: theme.onDanger }
    : tone === "secondary"
    ? { background: theme.surface, border: theme.border, text: theme.text }
    : { background: theme.accent, border: theme.accent, text: theme.onAccent };
  return mergeDefinedOverrides(colors, overrides);
}

/** A compact controlled action with explicit disabled and accessibility semantics. */
export class Button extends Component<ButtonProps> {
  onRender(): void {
    const {
      label,
      disabled = false,
      tone = "primary",
      theme,
      colors: colorOverrides,
      width,
      testTag,
      accessibilityLabel = label,
      accessibilityHint,
      style,
    } = this.viewModel;
    const colors = resolveButtonColors(tone, disabled, theme, colorOverrides);

    <view
      width={width}
      minHeight={42}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      padding="10 16"
      borderRadius={11}
      borderWidth={1}
      borderColor={colors.border}
      backgroundColor={colors.background}
      accessibilityId={testTag}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityCategory="button"
      accessibilityNavigation="leaf"
      accessibilityStateDisabled={disabled}
      touchEnabled={buttonPressEnabled(disabled)}
      onTap={disabled ? undefined : this.handlePress}
      style={toStyle<View | Layout>(style as any)}
    >
      <label
        value={label}
        color={colors.text}
        font={systemBoldFont(12)}
        textAlign="center"
        numberOfLines={1}
      />
    </view>;
  }

  private handlePress = (): void => {
    if (buttonPressEnabled(this.viewModel.disabled)) {
      this.viewModel.onPress();
    }
  };
}
