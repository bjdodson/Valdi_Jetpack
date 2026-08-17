import { StatefulComponent } from "valdi_core/src/Component";
import { systemBoldFont, systemFont } from "valdi_core/src/SystemFont";
import { CSSValue } from "valdi_tsx/src/NativeTemplateElements";

import { ComposeControlTheme, mergeDefinedOverrides, resolveComposeControlTheme } from "./ControlTheme";

export interface SelectOption {
  /** Stable, unique value used by the controlled selection. */
  value: string;
  label: string;
  disabled?: boolean;
  accessibilityLabel?: string;
  testTag?: string;
}

export interface SelectColors {
  triggerBackground: string;
  triggerBorder: string;
  expandedBorder: string;
  menuBackground: string;
  menuBorder: string;
  selectedBackground: string;
  text: string;
  selectedText: string;
  placeholderText: string;
  indicator: string;
  disabledText: string;
}

export interface SelectProps {
  options: readonly SelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  width?: CSSValue;
  menuMaxHeight?: CSSValue;
  theme?: Partial<ComposeControlTheme>;
  colors?: Partial<SelectColors>;
  testTag?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

interface SelectState {
  expanded: boolean;
}

/** Returns the selected option, or undefined when the controlled value is absent. */
export function selectedSelectOption(
  options: readonly SelectOption[],
  value: string,
): SelectOption | undefined {
  return options.find(option => option.value === value);
}

/** True when the trigger has at least one enabled choice and is not disabled. */
export function selectCanExpand(
  options: readonly SelectOption[],
  disabled = false,
): boolean {
  return !disabled && options.some(option => option.disabled !== true);
}

/** Resolves an option activation without changing disabled or already-selected values. */
export function nextSelectValue(
  currentValue: string,
  option: SelectOption,
  disabled = false,
): string {
  return disabled || option.disabled ? currentValue : option.value;
}

/** Resolves a trigger hint without inviting activation when it is unavailable. */
export function selectAccessibilityHint(
  canExpand: boolean,
  expanded: boolean,
  override?: string,
): string | undefined {
  if (override !== undefined) {
    return override;
  }
  if (!canExpand) {
    return undefined;
  }
  return expanded ? "Activate to hide options" : "Activate to show options";
}

export function resolveSelectColors(
  themeOverrides?: Partial<ComposeControlTheme>,
  overrides?: Partial<SelectColors>,
): SelectColors {
  const theme = resolveComposeControlTheme(themeOverrides);
  return mergeDefinedOverrides({
    triggerBackground: theme.surface,
    triggerBorder: theme.border,
    expandedBorder: theme.accent,
    menuBackground: theme.surfaceRaised,
    menuBorder: theme.border,
    selectedBackground: theme.surfaceSelected,
    text: theme.textMuted,
    selectedText: theme.text,
    placeholderText: theme.textDisabled,
    indicator: theme.accent,
    disabledText: theme.textDisabled,
  }, overrides);
}

/**
 * A controlled single-selection dropdown. Only transient menu visibility is
 * internal; `value` always remains caller-owned.
 *
 * Valdi 0.1.1 provides tap and accessibility activation but no portable
 * generic key event or focus-management API. The trigger and options expose
 * the strongest portable button/radio semantics available today; direct
 * arrow-key, Escape, and focus-restoration behavior is deferred until the
 * runtime exposes those events.
 */
export class Select extends StatefulComponent<SelectProps, SelectState> {
  state: SelectState = { expanded: false };

  onViewModelUpdate(): void {
    if (this.state.expanded && !selectCanExpand(this.viewModel.options, this.viewModel.disabled)) {
      this.setState({ expanded: false });
    }
  }

  onRender(): void {
    const {
      options,
      value,
      disabled = false,
      placeholder = "Select an option",
      width = "100%",
      menuMaxHeight = 260,
      theme: themeOverrides,
      testTag,
      accessibilityLabel = "Selection",
      accessibilityHint,
    } = this.viewModel;
    const theme = resolveComposeControlTheme(themeOverrides);
    const colors = resolveSelectColors(themeOverrides, this.viewModel.colors);
    const selected = selectedSelectOption(options, value);
    const canExpand = selectCanExpand(options, disabled);
    const expanded = this.state.expanded && canExpand;
    const displayLabel = selected?.label ?? placeholder;

    <view width={width} flexDirection="column" alignItems="stretch">
      <view
        minHeight={42}
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        padding="10 12"
        borderRadius={10}
        borderWidth={1}
        borderColor={!canExpand ? theme.borderDisabled : expanded ? colors.expandedBorder : colors.triggerBorder}
        backgroundColor={!canExpand ? theme.surfaceDisabled : colors.triggerBackground}
        accessibilityId={testTag}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={selectAccessibilityHint(canExpand, expanded, accessibilityHint)}
        accessibilityValue={displayLabel}
        accessibilityCategory="button"
        accessibilityNavigation="leaf"
        accessibilityStateDisabled={!canExpand}
        touchEnabled={canExpand}
        onTap={canExpand ? this.toggleExpanded : undefined}
      >
        <label
          value={displayLabel}
          color={!canExpand ? colors.disabledText : selected ? colors.selectedText : colors.placeholderText}
          font={systemFont(12)}
          numberOfLines={1}
          flexGrow={1}
          flexShrink={1}
        />
        <label
          value={expanded ? "▲" : "▼"}
          color={!canExpand ? colors.disabledText : colors.indicator}
          font={systemBoldFont(10)}
          marginLeft={10}
          accessibilityNavigation="ignored"
        />
      </view>
      {expanded ? (
        <view
          marginTop={6}
          padding={4}
          borderRadius={10}
          borderWidth={1}
          borderColor={colors.menuBorder}
          backgroundColor={colors.menuBackground}
          boxShadow={`0 8 24 ${theme.shadow}`}
          accessibilityId={testTag ? `${testTag}_menu` : undefined}
          accessibilityLabel={`${accessibilityLabel} options`}
          accessibilityNavigation="group"
        >
          <scroll maxHeight={menuMaxHeight} showsVerticalScrollIndicator={true}>
            <view flexDirection="column" alignItems="stretch">
              {options.forEach((option, index) => this.renderOption(option, index, value, disabled, colors))}
            </view>
          </scroll>
        </view>
      ) : undefined}
    </view>;
  }

  private renderOption(
    option: SelectOption,
    index: number,
    currentValue: string,
    controlDisabled: boolean,
    colors: SelectColors,
  ): void {
    const selected = option.value === currentValue;
    const disabled = controlDisabled || option.disabled === true;
    const optionTestTag = option.testTag ?? (this.viewModel.testTag ? `${this.viewModel.testTag}_option_${index}` : undefined);

    <view
      key={option.value}
      minHeight={38}
      flexDirection="row"
      alignItems="center"
      padding="9 10"
      marginTop={index === 0 ? 0 : 2}
      borderRadius={8}
      backgroundColor={selected ? colors.selectedBackground : "transparent"}
      accessibilityId={optionTestTag}
      accessibilityLabel={option.accessibilityLabel ?? option.label}
      accessibilityCategory="radio"
      accessibilityNavigation="leaf"
      accessibilityStateSelected={selected}
      accessibilityStateDisabled={disabled}
      touchEnabled={!disabled}
      onTap={disabled ? undefined : () => this.handleOptionPress(option)}
    >
      <label
        value={selected ? "✓" : ""}
        width={18}
        marginRight={8}
        color={disabled ? colors.disabledText : colors.indicator}
        font={systemBoldFont(11)}
        accessibilityNavigation="ignored"
      />
      <label
        value={option.label}
        color={disabled ? colors.disabledText : selected ? colors.selectedText : colors.text}
        font={selected ? systemBoldFont(12) : systemFont(12)}
        numberOfLines={1}
        flexGrow={1}
        flexShrink={1}
        accessibilityNavigation="ignored"
      />
    </view>;
  }

  private toggleExpanded = (): void => {
    if (selectCanExpand(this.viewModel.options, this.viewModel.disabled)) {
      this.setState({ expanded: !this.state.expanded });
    }
  };

  private handleOptionPress(option: SelectOption): void {
    const currentValue = this.viewModel.value;
    const nextValue = nextSelectValue(currentValue, option, this.viewModel.disabled);
    this.setState({ expanded: false });
    if (nextValue !== currentValue) {
      this.viewModel.onValueChange(nextValue);
    }
  }
}
