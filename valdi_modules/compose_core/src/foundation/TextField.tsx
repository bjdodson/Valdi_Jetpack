import { Component } from "valdi_core/src/Component";
import { Style } from "valdi_core/src/Style";
import { systemFont } from "valdi_core/src/SystemFont";
import { CSSValue, Layout, View } from "valdi_tsx/src/NativeTemplateElements";

import { toStyle } from "../layout/types";
import { ComposeControlTheme, mergeDefinedOverrides, resolveComposeControlTheme } from "./ControlTheme";

export interface TextFieldColors {
  background: string;
  border: string;
  text: string;
  placeholder: string;
  disabledBackground: string;
  disabledBorder: string;
  disabledText: string;
}

export interface TextFieldProps {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  width?: CSSValue;
  theme?: Partial<ComposeControlTheme>;
  colors?: Partial<TextFieldColors>;
  testTag?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: Style<View | Layout> | Partial<View & Layout>;
}

/** Resolves a native edit while preserving a disabled controlled value. */
export function nextTextFieldValue(currentValue: string, editedValue: string, disabled = false): string {
  return disabled ? currentValue : editedValue;
}

/** Returns the caller-owned value that may be submitted, or undefined when disabled. */
export function textFieldSubmissionValue(value: string, disabled = false): string | undefined {
  return disabled ? undefined : value;
}

export function resolveTextFieldColors(
  themeOverrides?: Partial<ComposeControlTheme>,
  overrides?: Partial<TextFieldColors>,
): TextFieldColors {
  const theme = resolveComposeControlTheme(themeOverrides);
  return mergeDefinedOverrides({
    background: theme.surface,
    border: theme.border,
    text: theme.text,
    placeholder: theme.textDisabled,
    disabledBackground: theme.surfaceDisabled,
    disabledBorder: theme.borderDisabled,
    disabledText: theme.textDisabled,
  }, overrides);
}

/**
 * Controlled single-line text input with Compose-style naming.
 *
 * The native field owns its keyboard session. Pinned Valdi does not expose a
 * portable imperative focus/request-keyboard API or generic key-down events,
 * so focus traversal and non-return keyboard shortcuts remain host concerns.
 */
export class TextField extends Component<TextFieldProps> {
  onRender(): void {
    const {
      value,
      placeholder,
      disabled = false,
      width = "100%",
      theme: themeOverrides,
      testTag,
      accessibilityLabel = placeholder ?? "Text field",
      accessibilityHint,
      style,
    } = this.viewModel;
    const colors = resolveTextFieldColors(themeOverrides, this.viewModel.colors);

    <view
      width={width}
      minHeight={42}
      padding="10 12"
      borderRadius={10}
      borderWidth={1}
      borderColor={disabled ? colors.disabledBorder : colors.border}
      backgroundColor={disabled ? colors.disabledBackground : colors.background}
      accessibilityId={testTag}
      style={toStyle<View | Layout>(style as any)}
    >
      <textfield
        value={value}
        placeholder={placeholder}
        width="100%"
        height={22}
        backgroundColor="transparent"
        color={disabled ? colors.disabledText : colors.text}
        placeholderColor={colors.placeholder}
        font={systemFont(12)}
        enabled={!disabled}
        autocapitalization="none"
        autocorrection="none"
        contentType="default"
        returnKeyText="done"
        closesWhenReturnKeyPressed={true}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityValue={value}
        accessibilityNavigation="leaf"
        accessibilityStateDisabled={disabled}
        onChange={event => this.handleChange(event.text)}
        onReturn={() => this.handleReturn()}
      />
    </view>;
  }

  private handleChange(editedValue: string): void {
    const nextValue = nextTextFieldValue(this.viewModel.value, editedValue, this.viewModel.disabled);
    if (nextValue !== this.viewModel.value) {
      this.viewModel.onValueChange(nextValue);
    }
  }

  private handleReturn(): void {
    const value = textFieldSubmissionValue(this.viewModel.value, this.viewModel.disabled);
    if (value !== undefined) {
      this.viewModel.onSubmit?.(value);
    }
  }
}
