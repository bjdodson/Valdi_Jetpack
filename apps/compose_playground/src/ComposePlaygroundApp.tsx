import { Component } from 'valdi_core/src/Component';

import { ComposePlayground } from './ComposePlayground';

/**
 * @ViewModel
 * @ExportModel({ ios: 'VLComposePlaygroundViewModel', android: 'com.snap.valdi.composeplayground.ComposePlaygroundViewModel' })
 */
export interface ComposePlaygroundViewModel {}

/**
 * @Context
 * @ExportModel({ ios: 'VLComposePlaygroundAppContext', android: 'com.snap.valdi.composeplayground.ComposePlaygroundAppContext' })
 */
export interface ComposePlaygroundAppContext {
  onDone?: () => void;
}

/**
 * @Component
 * @ExportModel({ ios: 'VLComposePlayground', android: 'com.snap.valdi.composeplayground.ComposePlaygroundApp' })
 */
export class ComposePlaygroundApp extends Component<ComposePlaygroundViewModel, ComposePlaygroundAppContext> {
  onCreate(): void {
    console.log('Compose Playground app created');
  }

  onRender(): void {
    <ComposePlayground context={this.context} />;
  }
}
