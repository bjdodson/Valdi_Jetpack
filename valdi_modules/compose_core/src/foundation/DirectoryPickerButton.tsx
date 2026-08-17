import { Component } from "valdi_core/src/Component";
import { CSSValue } from "valdi_tsx/src/NativeTemplateElements";

import { Button } from "./Button";
import { ComposeControlTheme, mergeDefinedOverrides } from "./ControlTheme";
import { macOSNativeActionAvailable } from "./NativeActionAvailability";

export interface DirectoryPickerCopy {
  label: string;
  panelTitle: string;
  panelPrompt: string;
  panelMessage: string;
  unavailableLabel: string;
  unavailableAccessibilityLabel: string;
}

export const defaultDirectoryPickerCopy: Readonly<DirectoryPickerCopy> = {
  label: "Choose folder…",
  panelTitle: "Choose a folder",
  panelPrompt: "Choose",
  panelMessage: "",
  unavailableLabel: "Folder picker unavailable",
  unavailableAccessibilityLabel: "Folder picker unavailable on this platform",
};

export interface DirectoryPickerButtonProps {
  onPathSelected: (path: string) => void;
  copy?: Partial<DirectoryPickerCopy>;
  canCreateDirectories?: boolean;
  disabled?: boolean;
  width?: CSSValue;
  /** Theme for the non-macOS unavailable fallback; AppKit owns native styling. */
  fallbackTheme?: Partial<ComposeControlTheme>;
  testTag?: string;
  accessibilityLabel?: string;
}

/** Resolves caller copy without mutating it or accepting undefined overrides. */
export function resolveDirectoryPickerCopy(overrides?: Partial<DirectoryPickerCopy>): DirectoryPickerCopy {
  return mergeDefinedOverrides(defaultDirectoryPickerCopy, overrides);
}

/** True when the current Valdi runtime can host the macOS native directory chooser. */
export function directoryPickerAvailable(): boolean {
  return macOSNativeActionAvailable();
}

/** Single-directory macOS chooser with an explicit disabled fallback elsewhere. */
export class DirectoryPickerButton extends Component<DirectoryPickerButtonProps> {
  onRender(): void {
    const {
      onPathSelected,
      canCreateDirectories = false,
      disabled = false,
      width = "100%",
      fallbackTheme,
      testTag = "compose_core_directory_picker",
      accessibilityLabel,
    } = this.viewModel;
    const copy = resolveDirectoryPickerCopy(this.viewModel.copy);

    if (!directoryPickerAvailable()) {
      <Button
        label={copy.unavailableLabel}
        onPress={this.ignoreUnavailablePress}
        disabled={true}
        width={width}
        theme={fallbackTheme}
        testTag={testTag}
        accessibilityLabel={copy.unavailableAccessibilityLabel}
      />;
      return;
    }

    <custom-view
      iosClass="VJComposeDirectoryPickerButton"
      width={width}
      height={42}
      label={copy.label}
      panelTitle={copy.panelTitle}
      panelPrompt={copy.panelPrompt}
      panelMessage={copy.panelMessage}
      canCreateDirectories={canCreateDirectories}
      disabled={disabled}
      onPathSelected={onPathSelected}
      accessibilityId={testTag}
      accessibilityLabel={accessibilityLabel ?? copy.label}
    />;
  }

  private ignoreUnavailablePress = (): void => {};
}
