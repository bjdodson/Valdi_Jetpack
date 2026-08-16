import { StatefulComponent } from "valdi_core/src/Component";
import { Style } from "valdi_core/src/Style";
import { systemFont } from "valdi_core/src/SystemFont";
import { Layout, View } from "valdi_tsx/src/NativeTemplateElements";

import { Row } from "../layout/Row";
import { toStyle } from "../layout/types";
import { Button } from "./Button";
import { ComposeControlTheme, mergeDefinedOverrides, resolveComposeControlTheme } from "./ControlTheme";
import { macOSNativeActionAvailable } from "./NativeActionAvailability";
import { Text } from "./Text";

export type ImageExportOperation = "copy" | "downloads" | "save-as";
export type ImageExportOutcome = "success" | "cancelled" | "failed";
export type ImageExportReason =
  | "cancelled"
  | "clipboard-failed"
  | "copied"
  | "downloads-unavailable"
  | "invalid-image"
  | "invalid-source"
  | "load-failed"
  | "saved-downloads"
  | "saved-selected"
  | "size-limit"
  | "unsupported-operation"
  | "write-failed"
  | "unknown";

export interface ImageExportResult {
  operation: ImageExportOperation;
  outcome: ImageExportOutcome;
  reason: ImageExportReason;
  message: string;
}

export interface ImageExportLabels {
  openMenu: string;
  closeMenu: string;
  busy: string;
  menuAccessibilityLabel: string;
  copyLabel: string;
  copyHint: string;
  downloadsLabel: string;
  downloadsHint: string;
  saveAsLabel: string;
  saveAsHint: string;
  missingSourceMessage: string;
  unavailableMessage: string;
}

export interface ImageExportActionsColors {
  menuBackground: string;
  menuBorder: string;
  optionText: string;
  optionDescription: string;
  statusText: string;
  errorText: string;
  unavailableText: string;
}

export const defaultImageExportLabels: Readonly<ImageExportLabels> = {
  openMenu: "Export…",
  closeMenu: "Close export",
  busy: "Exporting…",
  menuAccessibilityLabel: "Image export choices",
  copyLabel: "Copy image",
  copyHint: "Copy the image to the system clipboard",
  downloadsLabel: "Save to Downloads",
  downloadsHint: "Save without overwriting an existing Downloads file",
  saveAsLabel: "Save As…",
  saveAsHint: "Choose a location and file name",
  missingSourceMessage: "Provide an image source to export.",
  unavailableMessage: "Native image export is unavailable on this platform.",
};

export interface ImageExportActionsProps {
  source: string;
  suggestedFileName: string;
  onResult?: (result: ImageExportResult) => void;
  disabled?: boolean;
  labels?: Partial<ImageExportLabels>;
  theme?: Partial<ComposeControlTheme>;
  colors?: Partial<ImageExportActionsColors>;
  style?: Style<View | Layout> | Partial<View & Layout>;
  testTag?: string;
  accessibilityLabel?: string;
}

interface ImageExportActionsState {
  request?: string;
  requestSource?: string;
  requestSuggestedFileName?: string;
  busy?: ImageExportOperation;
  menuOpen?: boolean;
  outcome?: ImageExportOutcome;
  status?: string;
}

export function resolveImageExportLabels(overrides?: Partial<ImageExportLabels>): ImageExportLabels {
  return mergeDefinedOverrides(defaultImageExportLabels, overrides);
}

export function resolveImageExportColors(
  themeOverrides?: Partial<ComposeControlTheme>,
  overrides?: Partial<ImageExportActionsColors>,
): ImageExportActionsColors {
  const theme = resolveComposeControlTheme(themeOverrides);
  return mergeDefinedOverrides({
    menuBackground: theme.surfaceRaised,
    menuBorder: theme.border,
    optionText: theme.text,
    optionDescription: theme.textMuted,
    statusText: theme.accent,
    errorText: theme.danger,
    unavailableText: theme.textDisabled,
  }, overrides);
}

export function imageExportRequest(operation: ImageExportOperation, sequence: number): string {
  const resolvedSequence = Number.isFinite(sequence) ? Math.max(1, Math.floor(sequence)) : 1;
  return `${operation}:${resolvedSequence}`;
}

export function imageExportOperationFromRequest(request: string): ImageExportOperation | undefined {
  const operation = request.split(":", 1)[0];
  return operation === "copy" || operation === "downloads" || operation === "save-as"
    ? operation
    : undefined;
}

export function normalizeImageExportOutcome(rawOutcome: string): ImageExportOutcome {
  return rawOutcome === "success" || rawOutcome === "cancelled" ? rawOutcome : "failed";
}

export function normalizeImageExportReason(rawReason: string): ImageExportReason {
  switch (rawReason) {
    case "cancelled":
    case "clipboard-failed":
    case "copied":
    case "downloads-unavailable":
    case "invalid-image":
    case "invalid-source":
    case "load-failed":
    case "saved-downloads":
    case "saved-selected":
    case "size-limit":
    case "unsupported-operation":
    case "write-failed":
      return rawReason;
    default:
      return "unknown";
  }
}

/**
 * Serializes one indivisible native command. Valdi may apply custom-view
 * attributes in any order, so source and filename travel with the request.
 */
export function imageExportNativeCommand(
  request: string | undefined,
  source: string | undefined,
  suggestedFileName: string | undefined,
  disabled: boolean,
): string {
  if (disabled || !request || !source || !imageExportOperationFromRequest(request)) {
    return "";
  }
  return JSON.stringify({
    version: 1,
    request,
    source,
    suggestedFileName: suggestedFileName || "image.jpg",
  });
}

/** True when the pinned runtime can host the macOS image-export bridge. */
export function imageExportAvailable(): boolean {
  return macOSNativeActionAvailable();
}

/** Native image clipboard/file actions while presentation remains in Valdi. */
export class ImageExportActions extends StatefulComponent<ImageExportActionsProps, ImageExportActionsState> {
  state: ImageExportActionsState = {};
  private requestSequence = 0;

  onViewModelUpdate(previousViewModel?: Readonly<ImageExportActionsProps>): void {
    const sourceChanged = previousViewModel && previousViewModel.source !== this.viewModel.source;
    const becameDisabled = previousViewModel && !previousViewModel.disabled && Boolean(this.viewModel.disabled);
    if (sourceChanged || becameDisabled) {
      this.setState({
        request: undefined,
        requestSource: undefined,
        requestSuggestedFileName: undefined,
        busy: undefined,
        menuOpen: false,
        outcome: undefined,
        status: undefined,
      });
    }
  }

  onRender(): void {
    const labels = resolveImageExportLabels(this.viewModel.labels);
    const colors = resolveImageExportColors(this.viewModel.theme, this.viewModel.colors);
    const platformAvailable = imageExportAvailable();
    const hasSource = Boolean(this.viewModel.source);
    const available = platformAvailable && hasSource;
    const enabled = available && !this.viewModel.disabled;
    const busy = this.state.busy !== undefined;

    <view
      flexDirection="column"
      alignItems="stretch"
      accessibilityId={this.viewModel.testTag ?? "compose_core_image_export"}
      accessibilityLabel={this.viewModel.accessibilityLabel ?? "Export image"}
      accessibilityStateDisabled={!enabled}
      style={toStyle<View | Layout>(this.viewModel.style as any)}
    >
      {available ? (
        <custom-view
          iosClass="VJComposeImageExportBridge"
          onResult={this.handleNativeResult}
          command={imageExportNativeCommand(
            this.state.request,
            this.state.requestSource === this.viewModel.source ? this.state.requestSource : undefined,
            this.state.requestSuggestedFileName,
            Boolean(this.viewModel.disabled),
          )}
          width={1}
          height={1}
        />
      ) : undefined}
      <Row wrap="wrap" verticalAlignment="center">
        <Button
          label={busy ? labels.busy : this.state.menuOpen ? labels.closeMenu : labels.openMenu}
          onPress={this.toggleMenu}
          disabled={!enabled || busy}
          theme={this.viewModel.theme}
          testTag="compose_core_image_export_menu"
          accessibilityHint="Show clipboard and file export choices"
        />
      </Row>
      {enabled && this.state.menuOpen ? (
        <view
          width={300}
          maxWidth="100%"
          flexDirection="column"
          alignItems="stretch"
          backgroundColor={colors.menuBackground}
          borderColor={colors.menuBorder}
          borderWidth={1}
          borderRadius={12}
          padding={6}
          marginTop={7}
          accessibilityLabel={labels.menuAccessibilityLabel}
          accessibilityNavigation="group"
        >
          {this.renderExportChoice(labels.copyLabel, labels.copyHint, "copy", "compose_core_image_export_copy", colors)}
          {this.renderExportChoice(
            labels.downloadsLabel,
            labels.downloadsHint,
            "downloads",
            "compose_core_image_export_downloads",
            colors,
          )}
          {this.renderExportChoice(
            labels.saveAsLabel,
            labels.saveAsHint,
            "save-as",
            "compose_core_image_export_save_as",
            colors,
          )}
        </view>
      ) : undefined}
      {this.state.status ? (
        <Text
          text={this.state.status}
          color={this.state.outcome === "failed" ? colors.errorText : colors.statusText}
          font={systemFont(10)}
          maxLines={2}
          style={{ height: 30, marginTop: 4 }}
          testTag="compose_core_image_export_status"
        />
      ) : !platformAvailable || !hasSource ? (
        <Text
          text={platformAvailable ? labels.missingSourceMessage : labels.unavailableMessage}
          color={colors.unavailableText}
          font={systemFont(10)}
          style={{ height: 16, marginTop: 4 }}
        />
      ) : undefined}
    </view>;
  }

  private renderExportChoice(
    label: string,
    description: string,
    operation: ImageExportOperation,
    testTag: string,
    colors: ImageExportActionsColors,
  ): void {
    <view
      minHeight={48}
      flexDirection="column"
      alignItems="stretch"
      justifyContent="center"
      padding="7 10"
      borderRadius={8}
      accessibilityId={testTag}
      accessibilityLabel={label}
      accessibilityHint={description}
      accessibilityCategory="button"
      accessibilityNavigation="leaf"
      onTap={() => this.perform(operation)}
    >
      <label value={label} color={colors.optionText} font={systemFont(12)} numberOfLines={1} />
      <label value={description} color={colors.optionDescription} font={systemFont(9)} numberOfLines={1} marginTop={2} />
    </view>;
  }

  private toggleMenu = (): void => {
    if (!imageExportAvailable() || !this.viewModel.source || this.viewModel.disabled || this.state.busy) {
      return;
    }
    this.setState({ menuOpen: !this.state.menuOpen });
  };

  private perform(operation: ImageExportOperation): void {
    if (!imageExportAvailable() || !this.viewModel.source || this.viewModel.disabled || this.state.busy) {
      return;
    }
    this.requestSequence += 1;
    this.setState({
      request: imageExportRequest(operation, this.requestSequence),
      requestSource: this.viewModel.source,
      requestSuggestedFileName: this.viewModel.suggestedFileName,
      busy: operation,
      menuOpen: false,
      outcome: undefined,
      status: undefined,
    });
  }

  private handleNativeResult = (request: string, rawOutcome: string, rawReason: string, message: string): void => {
    if (request !== this.state.request) {
      return;
    }
    const operation = imageExportOperationFromRequest(request);
    if (!operation) {
      return;
    }
    const outcome = normalizeImageExportOutcome(rawOutcome);
    const reason = normalizeImageExportReason(rawReason);
    this.setState({ busy: undefined, outcome, status: message });
    this.viewModel.onResult?.({ operation, outcome, reason, message });
  };
}
