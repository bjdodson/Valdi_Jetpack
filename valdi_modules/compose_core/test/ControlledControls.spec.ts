import 'jasmine/src/jasmine';

import {
  defaultComposeControlTheme,
  resolveButtonColors,
  resolveComposeControlTheme,
  resolveSelectColors,
  resolveTextFieldColors,
  selectAccessibilityHint,
  sliderValueFromPosition,
  textFieldSubmissionValue,
} from 'compose_core/src/index';

describe('controlled control helpers', () => {
  it('keeps explicit slider endpoints when the step does not divide the range', () => {
    expect(sliderValueFromPosition(0, 100, 0, 10, 3)).toBe(0);
    expect(sliderValueFromPosition(100, 100, 0, 10, 3)).toBe(10);
    expect(sliderValueFromPosition(80, 100, 0, 10, 3)).toBe(9);
  });

  it('ignores undefined theme and control color overrides at runtime', () => {
    expect(resolveComposeControlTheme({ accent: undefined }).accent).toBe(defaultComposeControlTheme.accent);
    expect(resolveButtonColors('primary', false, undefined, { background: undefined }).background)
      .toBe(defaultComposeControlTheme.accent);
    expect(resolveSelectColors(undefined, { indicator: undefined }).indicator)
      .toBe(defaultComposeControlTheme.accent);
    expect(resolveTextFieldColors(undefined, { border: undefined }).border)
      .toBe(defaultComposeControlTheme.border);
  });

  it('submits only the latest caller-owned text value', () => {
    expect(textFieldSubmissionValue('caller value')).toBe('caller value');
    expect(textFieldSubmissionValue('caller value', true)).toBeUndefined();
  });

  it('does not invite activation when a select trigger is unavailable', () => {
    expect(selectAccessibilityHint(false, false)).toBeUndefined();
    expect(selectAccessibilityHint(true, false)).toBe('Activate to show options');
    expect(selectAccessibilityHint(true, true)).toBe('Activate to hide options');
    expect(selectAccessibilityHint(false, false, 'Custom hint')).toBe('Custom hint');
  });
});
