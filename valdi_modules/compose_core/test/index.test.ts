import {
  Box,
  Button,
  Card,
  Column,
  Image,
  LazyColumn,
  LazyGrid,
  LazyRow,
  Row,
  SegmentedControl,
  Select,
  Slider,
  Spacer,
  Switch,
  TabBar,
  Text,
  TextField,
  Toggle,
  buttonPressEnabled,
  clampSliderValue,
  defaultComposeControlTheme,
  nextSegmentValue,
  nextSelectValue,
  nextTabValue,
  nextTextFieldValue,
  nextToggleValue,
  remember,
  resolveButtonColors,
  resolveComposeControlTheme,
  resolveSelectColors,
  resolveTextFieldColors,
  selectCanExpand,
  selectedSegmentIndex,
  selectedSelectOption,
  selectedTabIndex,
  sliderFraction,
  sliderInteractionEnabled,
  sliderValueFromPosition,
  textLineHeightRatio,
} from "compose_core/src/index";

[Row, Column, Box, Spacer, LazyRow, LazyColumn, Text, Image, Card, Button, Slider,
  SegmentedControl, Toggle, Switch, Select, TabBar, TextField, LazyGrid].forEach(component => {
  if (typeof component !== "function") {
    throw new Error(`Expected component export to be a class/function, got ${typeof component}`);
  }
  if (!component.prototype?.onRender) {
    throw new Error(`Expected ${component.name} to expose onRender`);
  }
});

const value = remember(() => 42);
if (value !== 42) {
  throw new Error("remember() did not invoke factory");
}

if (textLineHeightRatio(18, "system 12") !== 1.5) {
  throw new Error("Text did not convert an absolute line height to Valdi's multiplier");
}

if (textLineHeightRatio(15, "system-bold 10") !== 1.5) {
  throw new Error("Text did not read the font size from a bold system font");
}

if (textLineHeightRatio(18, "invalid") !== 1.5) {
  throw new Error("Text did not use the 12-point fallback for an invalid font string");
}

if (textLineHeightRatio() !== undefined) {
  throw new Error("Text changed an unspecified line height");
}

function expectEqual<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

const themeOverrides = { accent: "#7c3aed" };
const resolvedTheme = resolveComposeControlTheme(themeOverrides);
expectEqual(resolvedTheme.accent, "#7c3aed", "theme override");
expectEqual(resolvedTheme.text, defaultComposeControlTheme.text, "theme fallback");
expectEqual(themeOverrides.accent, "#7c3aed", "theme input remains unchanged");

expectEqual(buttonPressEnabled(), true, "enabled button");
expectEqual(buttonPressEnabled(true), false, "disabled button");
expectEqual(resolveButtonColors("primary").background, defaultComposeControlTheme.accent, "primary button token");
expectEqual(resolveButtonColors("danger").text, defaultComposeControlTheme.onDanger, "danger button token");

expectEqual(clampSliderValue(20, 0, 10), 10, "slider clamp");
expectEqual(clampSliderValue(Number.NaN, 2, 10), 2, "slider non-finite fallback");
expectEqual(sliderFraction(5, 0, 10), 0.5, "slider fraction");
expectEqual(sliderInteractionEnabled(1, 1), false, "slider invalid range");
expectEqual(sliderValueFromPosition(40, 100, 0, 10, 2), 4, "slider step");

const choices = [
  { value: "first", label: "First" },
  { value: "second", label: "Second", disabled: true },
] as const;
expectEqual(selectedSegmentIndex(choices, "first"), 0, "selected segment");
expectEqual(nextSegmentValue("first", choices[1]), "first", "disabled segment");
expectEqual(selectedSelectOption(choices, "first")?.label, "First", "selected option");
expectEqual(selectCanExpand(choices), true, "select expansion");
expectEqual(nextSelectValue("first", choices[1]), "first", "disabled option");
expectEqual(selectedTabIndex(choices, "first"), 0, "selected tab");
expectEqual(nextTabValue("first", choices[1]), "first", "disabled tab");

expectEqual(nextToggleValue(false), true, "toggle change");
expectEqual(nextToggleValue(true, true), true, "disabled toggle");
expectEqual(nextTextFieldValue("kept", "edited", true), "kept", "disabled text field");
expectEqual(resolveSelectColors(undefined, { indicator: "#123456" }).indicator, "#123456", "select color override");
expectEqual(resolveTextFieldColors(undefined, { border: "#123456" }).border, "#123456", "text field color override");
