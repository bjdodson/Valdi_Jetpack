import { Component } from "valdi_core/src/Component";
import { systemBoldFont } from "valdi_core/src/SystemFont";
import { CSSValue } from "valdi_tsx/src/NativeTemplateElements";

import { ComposeControlTheme, resolveComposeControlTheme } from "./ControlTheme";

export interface TabBarOption {
  value: string;
  label: string;
  disabled?: boolean;
  accessibilityLabel?: string;
  testTag?: string;
}

export interface TabBarProps {
  options: readonly TabBarOption[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  width?: CSSValue;
  theme?: Partial<ComposeControlTheme>;
  selectedColor?: string;
  unselectedColor?: string;
  indicatorColor?: string;
  dividerColor?: string;
  disabledColor?: string;
  testTag?: string;
  accessibilityLabel?: string;
}

/** Returns the selected tab index, or -1 when the controlled value is absent. */
export function selectedTabIndex(options: readonly TabBarOption[], value: string): number {
  return options.findIndex(option => option.value === value);
}

/** Resolves a tab press without changing disabled or already-selected values. */
export function nextTabValue(
  currentValue: string,
  option: TabBarOption,
  disabled = false,
): string {
  return disabled || option.disabled ? currentValue : option.value;
}

/**
 * A controlled tab row for switching sibling views in place.
 *
 * Pinned Valdi does not expose a native `tab` accessibility category, focus
 * traversal API, or portable arrow-key callbacks. Each tab uses its closest
 * supported single-selection semantic (`radio`) with selected and disabled
 * state represented explicitly.
 */
export class TabBar extends Component<TabBarProps> {
  onRender(): void {
    const {
      options,
      value,
      disabled = false,
      width = "100%",
      theme: themeOverrides,
      testTag,
      accessibilityLabel = "Tabs",
    } = this.viewModel;
    const theme = resolveComposeControlTheme(themeOverrides);
    const dividerColor = this.viewModel.dividerColor ?? theme.border;

    <view
      width={width}
      minHeight={46}
      flexDirection="row"
      alignItems="stretch"
      backgroundColor="transparent"
      accessibilityId={testTag}
      accessibilityLabel={accessibilityLabel}
      accessibilityNavigation="group"
    >
      {options.forEach((option, index) => this.renderTab(option, index, value, disabled, dividerColor, theme))}
    </view>;
  }

  private renderTab(
    option: TabBarOption,
    index: number,
    currentValue: string,
    controlDisabled: boolean,
    dividerColor: string,
    theme: ComposeControlTheme,
  ): void {
    const selectedColor = this.viewModel.selectedColor ?? theme.text;
    const unselectedColor = this.viewModel.unselectedColor ?? theme.textMuted;
    const indicatorColor = this.viewModel.indicatorColor ?? theme.accent;
    const disabledColor = this.viewModel.disabledColor ?? theme.textDisabled;
    const selected = option.value === currentValue;
    const disabled = controlDisabled || option.disabled === true;
    const tabTestTag = option.testTag ?? (this.viewModel.testTag ? `${this.viewModel.testTag}_${option.value}` : undefined);

    <view
      minHeight={46}
      flexGrow={1}
      flexBasis={0}
      flexDirection="column"
      alignItems="stretch"
      justifyContent="flex-end"
      marginLeft={index === 0 ? 0 : 2}
      accessibilityId={tabTestTag}
      accessibilityLabel={option.accessibilityLabel ?? option.label}
      accessibilityValue={selected ? "Selected" : "Not selected"}
      accessibilityCategory="radio"
      accessibilityNavigation="leaf"
      accessibilityStateSelected={selected}
      accessibilityStateDisabled={disabled}
      touchEnabled={!disabled}
      onTap={disabled ? undefined : () => this.handleTabPress(option)}
    >
      <view
        minHeight={42}
        flexGrow={1}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        padding="10 14 8 14"
      >
        <label
          value={option.label}
          color={disabled ? disabledColor : selected ? selectedColor : unselectedColor}
          font={systemBoldFont(12)}
          textAlign="center"
          numberOfLines={1}
        />
      </view>
      <view
        width="100%"
        height={selected ? 3 : 1}
        backgroundColor={selected ? indicatorColor : dividerColor}
      />
    </view>;
  }

  private handleTabPress(option: TabBarOption): void {
    const nextValue = nextTabValue(this.viewModel.value, option, this.viewModel.disabled);
    if (nextValue !== this.viewModel.value) {
      this.viewModel.onValueChange(nextValue);
    }
  }
}
