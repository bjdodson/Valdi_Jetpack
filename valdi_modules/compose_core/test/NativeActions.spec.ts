import 'jasmine/src/jasmine';

import {
  defaultComposeControlTheme,
  defaultDirectoryPickerCopy,
  defaultImageExportLabels,
  imageExportNativeCommand,
  imageExportOperationFromRequest,
  imageExportRequest,
  nativeMacOSActionAvailable,
  normalizeImageExportOutcome,
  normalizeImageExportReason,
  resolveDirectoryPickerCopy,
  resolveImageExportColors,
  resolveImageExportLabels,
} from 'compose_core/src/index';

describe('native action helpers', () => {
  it('resolves neutral directory-picker copy without mutating caller overrides', () => {
    const overrides = { label: 'Select library…', panelMessage: 'Choose an existing folder.' };
    const resolved = resolveDirectoryPickerCopy(overrides);

    expect(resolved.label).toBe('Select library…');
    expect(resolved.panelMessage).toBe('Choose an existing folder.');
    expect(resolved.panelPrompt).toBe(defaultDirectoryPickerCopy.panelPrompt);
    expect(overrides).toEqual({ label: 'Select library…', panelMessage: 'Choose an existing folder.' });
    expect(resolveDirectoryPickerCopy({ label: undefined }).label).toBe(defaultDirectoryPickerCopy.label);
  });

  it('keeps default copy free of product-specific vocabulary', () => {
    const defaults = `${JSON.stringify(defaultDirectoryPickerCopy)} ${JSON.stringify(defaultImageExportLabels)}`;
    expect(defaults.toLowerCase()).not.toMatch(/astro|capture|workspace|artifact/);
  });

  it('resolves labels and semantic colors without mutating inputs', () => {
    const labels = { copyLabel: 'Copy preview' };
    const colors = { statusText: '#123456' };

    expect(resolveImageExportLabels(labels).copyLabel).toBe('Copy preview');
    expect(resolveImageExportLabels({ copyLabel: undefined }).copyLabel).toBe(defaultImageExportLabels.copyLabel);
    expect(resolveImageExportColors(undefined, colors).statusText).toBe('#123456');
    expect(resolveImageExportColors({ danger: '#ff0000' }).errorText).toBe('#ff0000');
    expect(resolveImageExportColors(undefined, { menuBorder: undefined }).menuBorder)
      .toBe(defaultComposeControlTheme.border);
    expect(labels).toEqual({ copyLabel: 'Copy preview' });
    expect(colors).toEqual({ statusText: '#123456' });
  });

  it('builds deterministic requests and recognizes only supported operations', () => {
    expect(imageExportRequest('copy', 3.9)).toBe('copy:3');
    expect(imageExportRequest('save-as', Number.NaN)).toBe('save-as:1');
    expect(imageExportOperationFromRequest('downloads:4')).toBe('downloads');
    expect(imageExportOperationFromRequest('share:4')).toBeUndefined();
  });

  it('normalizes unknown native outcomes to failure', () => {
    expect(normalizeImageExportOutcome('success')).toBe('success');
    expect(normalizeImageExportOutcome('cancelled')).toBe('cancelled');
    expect(normalizeImageExportOutcome('unexpected')).toBe('failed');
    expect(normalizeImageExportReason('size-limit')).toBe('size-limit');
    expect(normalizeImageExportReason('unexpected')).toBe('unknown');
  });

  it('serializes an atomic native command only for a complete enabled request', () => {
    const command = imageExportNativeCommand('downloads:7', 'file:///tmp/image.png', 'final image.png', false);
    expect(JSON.parse(command)).toEqual({
      version: 1,
      request: 'downloads:7',
      source: 'file:///tmp/image.png',
      suggestedFileName: 'final image.png',
    });
    expect(imageExportNativeCommand(undefined, 'file:///tmp/image.png', 'image.png', false)).toBe('');
    expect(imageExportNativeCommand('copy:1', 'file:///tmp/image.png', 'image.png', true)).toBe('');
    expect(imageExportNativeCommand('share:1', 'file:///tmp/image.png', 'image.png', false)).toBe('');
  });

  it('requires the native macOS capability and rejects DOM-backed runtimes', () => {
    expect(nativeMacOSActionAvailable(true, false)).toBe(true);
    expect(nativeMacOSActionAvailable(true, true)).toBe(false);
    expect(nativeMacOSActionAvailable(false, false)).toBe(false);
    expect(nativeMacOSActionAvailable(false, true)).toBe(false);
  });
});
