import { StatefulComponent } from "valdi_core/src/Component";
import { systemBoldFont, systemFont } from "valdi_core/src/SystemFont";
import { ElementFrame } from "valdi_tsx/src/Geometry";
import { TouchEvent, TouchEventState } from "valdi_tsx/src/GestureEvents";
import { CSSValue } from "valdi_tsx/src/NativeTemplateElements";

import { ComposeControlTheme, resolveComposeControlTheme } from "./ControlTheme";

export interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  onValueChangeFinished?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  valueLabel?: string;
  theme?: Partial<ComposeControlTheme>;
  activeColor?: string;
  inactiveColor?: string;
  thumbColor?: string;
  disabled?: boolean;
  width?: CSSValue;
  testTag?: string;
  accessibilityLabel?: string;
}

interface SliderState {
  trackWidth: number;
  pressed: boolean;
}

export function clampSliderValue(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, value));
}

export function sliderFraction(value: number, min: number, max: number): number {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
    return 0;
  }
  return (clampSliderValue(value, min, max) - min) / (max - min);
}

/** True when the controlled range can respond to touch input. */
export function sliderInteractionEnabled(min: number, max: number, disabled = false): boolean {
  return !disabled && Number.isFinite(min) && Number.isFinite(max) && max > min;
}

export function sliderValueFromPosition(
  x: number,
  width: number,
  min: number,
  max: number,
  step: number,
): number {
  if (!Number.isFinite(x) || !Number.isFinite(width) || width <= 0 || max <= min) {
    return min;
  }
  const positionFraction = clampSliderValue(x / width, 0, 1);
  if (positionFraction <= 0) {
    return min;
  }
  if (positionFraction >= 1) {
    return max;
  }
  const rawValue = min + positionFraction * (max - min);
  const safeStep = Number.isFinite(step) && step > 0 ? step : max - min;
  const steppedValue = min + Math.round((rawValue - min) / safeStep) * safeStep;
  const precision = decimalPlaces(safeStep);
  return Number(clampSliderValue(steppedValue, min, max).toFixed(precision));
}

/**
 * A controlled slider built from Valdi touch and layout primitives.
 *
 * Valdi 0.1.1 has no portable keyboard-arrow or adjustable
 * accessibility action callback. Touch, value, disabled state, and accessible
 * value remain explicit; keyboard adjustment can be added when Valdi exposes
 * a generic key/focus surface.
 */
export class Slider extends StatefulComponent<SliderProps, SliderState> {
  state: SliderState = {
    trackWidth: 0,
    pressed: false,
  };

  onViewModelUpdate(): void {
    if (this.state.pressed && this.viewModel.disabled) {
      this.setState({ pressed: false });
    }
  }

  onRender(): void {
    const {
      value,
      min = 0,
      max = 1,
      label,
      valueLabel,
      theme: themeOverrides,
      disabled = false,
      width = "100%",
      testTag,
      accessibilityLabel,
    } = this.viewModel;
    const theme = resolveComposeControlTheme(themeOverrides);
    const activeColor = this.viewModel.activeColor ?? theme.accent;
    const inactiveColor = this.viewModel.inactiveColor ?? theme.surfaceMuted;
    const thumbColor = this.viewModel.thumbColor ?? theme.thumb;
    const interactive = sliderInteractionEnabled(min, max, disabled);
    const fraction = sliderFraction(value, min, max);
    const percentage = `${fraction * 100}%`;
    const resolvedActiveColor = interactive ? activeColor : theme.borderStrong;
    const resolvedThumbColor = interactive ? thumbColor : theme.textDisabled;

    <view width={width} flexDirection="column">
      {label || valueLabel ? (
        <view flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom={7}>
          <label value={label ?? ""} color={interactive ? theme.textMuted : theme.textDisabled} font={systemFont(12)} />
          <label value={valueLabel ?? String(value)} color={interactive ? theme.text : theme.textDisabled} font={systemBoldFont(12)} />
        </view>
      ) : undefined}
      <view
        width="100%"
        height={38}
        justifyContent="center"
        accessibilityId={testTag}
        accessibilityLabel={accessibilityLabel ?? label ?? "Slider"}
        accessibilityValue={valueLabel ?? String(value)}
        accessibilityCategory="input"
        accessibilityNavigation="leaf"
        accessibilityStateDisabled={!interactive}
        touchEnabled={interactive}
        onLayout={this.handleLayout}
        onTouch={interactive ? this.handleTouch : undefined}
        onTouchDelayDuration={0}
      >
        <view width="100%" height={5} borderRadius={3} backgroundColor={inactiveColor} />
        <view
          position="absolute"
          left={0}
          width={percentage}
          height={5}
          borderRadius={3}
          backgroundColor={resolvedActiveColor}
        />
        <view
          position="absolute"
          left={percentage}
          marginLeft={this.state.pressed ? -11 : -9}
          width={this.state.pressed ? 22 : 18}
          height={this.state.pressed ? 22 : 18}
          borderRadius={999}
          backgroundColor={resolvedThumbColor}
          borderColor={resolvedActiveColor}
          borderWidth={3}
          boxShadow={`0 2 8 ${theme.shadow}`}
        />
      </view>
    </view>;
  }

  private handleLayout = (frame: ElementFrame): void => {
    if (frame.width !== this.state.trackWidth) {
      this.setState({ trackWidth: frame.width });
    }
  };

  private handleTouch = (event: TouchEvent): void => {
    const { min = 0, max = 1, step = 0.01, onValueChange, onValueChangeFinished } = this.viewModel;
    if (!sliderInteractionEnabled(min, max, this.viewModel.disabled)) {
      return;
    }
    const nextValue = sliderValueFromPosition(event.x, this.state.trackWidth, min, max, step);
    const pressed = event.state !== TouchEventState.Ended;
    if (pressed !== this.state.pressed) {
      this.setState({ pressed });
    }
    if (nextValue !== this.viewModel.value) {
      onValueChange(nextValue);
    }
    if (event.state === TouchEventState.Ended) {
      onValueChangeFinished?.(nextValue);
    }
  };
}

function decimalPlaces(value: number): number {
  const rendered = String(value);
  const exponentMarker = rendered.indexOf("e-");
  if (exponentMarker >= 0) {
    return Number(rendered.slice(exponentMarker + 2));
  }
  const decimalMarker = rendered.indexOf(".");
  return decimalMarker >= 0 ? rendered.length - decimalMarker - 1 : 0;
}
