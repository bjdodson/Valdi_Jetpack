import { StatefulComponent } from 'valdi_core/src/Component';
import { Row, Column, Box } from 'compose_core/src/index';
import { FlexJustifyContent } from 'compose_core/src/layout/types';

export interface ComposePlaygroundViewModel {}

/**
 * @Context
 * @ExportModel({ ios: 'VLComposePlaygroundContentContext', android: 'com.snap.valdi.composeplayground.ComposePlaygroundContext' })
 */
export interface ComposePlaygroundContext {
  onDone?: () => void;
}

interface ComposePlaygroundState {
  arrangementIndex: number;
  counter: number;
}

type ArrangementOption = {
  label: string;
  value: FlexJustifyContent;
};

const ARRANGEMENTS: ArrangementOption[] = [
  { label: 'flex-start', value: 'flex-start' },
  { label: 'center', value: 'center' },
  { label: 'space-between', value: 'space-between' },
  { label: 'space-around', value: 'space-around' },
];

const BOX_COLORS = ['#8E7DFF', '#FF9AA2', '#68D391'];

const FEATURE_GROUPS = [
  { title: 'Spacing', tags: ['Padding', 'Margin', 'Gap'] },
  { title: 'Alignment', tags: ['Center', 'Stretch', 'Baseline'] },
  { title: 'Wrapping', tags: ['nowrap', 'wrap', 'wrap-reverse'] },
];

/**
 * @Component
 * @ExportModel({ ios: 'VLComposePlaygroundView', android: 'com.snap.valdi.composeplayground.ComposePlaygroundView' })
 */
export class ComposePlayground extends StatefulComponent<ComposePlaygroundViewModel, ComposePlaygroundState, ComposePlaygroundContext> {
  state: ComposePlaygroundState = {
    arrangementIndex: 0,
    counter: 0,
  };

  onRender(): void {
    const arrangement = ARRANGEMENTS[this.state.arrangementIndex];

    <view flexGrow={1}>
      <scroll backgroundColor="#f5f5f7">
        <view padding="32 24 48 24" minHeight="100%">
          <label value="Valdi Compose Playground" color="#0f172a" accessibilityCategory="header" />
          <label value="Small showcase powered by compose_core primitives." marginTop={8} color="#475467" />
          <view marginTop={32}>
            {this.renderRowDemo(arrangement)}
            {this.renderColumnDemo()}
            {this.renderStateDemo()}
          </view>
        </view>
      </scroll>
    </view>;
  }

  private renderRowDemo(arrangement: ArrangementOption) {
    <view
      backgroundColor="white"
      padding="20"
      borderRadius={28}
      marginBottom={24}
      boxShadow="0 18 48 rgba(15, 23, 42, 0.08)"
    >
      <label value="Row layout" color="#0f172a" />
      <label value={`horizontalArrangement: ${arrangement.label}`} marginTop={4} color="#475467" />
      <view
        marginTop={12}
        padding="10 16"
        borderRadius={999}
        backgroundColor="#111827"
        alignSelf="flex-start"
        onTap={this.handleCycleArrangement}
      >
        <label color="white" value="Tap to cycle alignment" />
      </view>
      <Row horizontalArrangement={arrangement.value} verticalAlignment="center">
        {BOX_COLORS.forEach((color, index) => {
          this.renderDemoBox(String.fromCharCode(65 + index), color);
        })}
      </Row>
    </view>;
  }

  private renderColumnDemo() {
    <view
      backgroundColor="white"
      padding="20"
      borderRadius={28}
      marginBottom={24}
      boxShadow="0 18 48 rgba(15, 23, 42, 0.08)"
    >
      <label value="Column layout" color="#0f172a" />
      <label value="horizontalAlignment: stretch" marginTop={4} color="#475467" />
      <Column horizontalAlignment="stretch" verticalArrangement="flex-start">
        {FEATURE_GROUPS.forEach(group => {
          <view backgroundColor="#f9fafb" padding="12 16" borderRadius={18} marginTop={12}>
            <label value={group.title} color="#0f172a" />
            <view marginTop={8}>
              <Row horizontalArrangement="flex-start" verticalAlignment="center" wrap="wrap">
                {group.tags.forEach(tag => {
                  this.renderTag(tag);
                })}
              </Row>
            </view>
          </view>;
        })}
      </Column>
    </view>;
  }

  private renderStateDemo() {
    <view
      backgroundColor="white"
      padding="20"
      borderRadius={28}
      marginBottom={24}
      boxShadow="0 18 48 rgba(15, 23, 42, 0.08)"
    >
      <label value="Stateful components" color="#0f172a" />
      <label value="StatefulComponent + setState demo" marginTop={4} color="#475467" />
      <view marginTop={16}>
        <Row horizontalArrangement="flex-start" verticalAlignment="center" wrap="wrap">
          <Box contentAlignment="center">
            <view
              margin="4 12 4 0"
              padding="14 18"
              borderRadius={22}
              backgroundColor="#1d4ed8"
              alignItems="center"
              justifyContent="center"
            >
              <label value={`Counter: ${this.state.counter}`} color="white" />
            </view>
          </Box>
          <view
            margin="4 12 4 0"
            padding="12 18"
            borderRadius={999}
            backgroundColor="#dbeafe"
            alignItems="center"
            onTap={this.incrementCounter}
          >
            <label value="Tap to increment" color="#1d4ed8" />
          </view>
        </Row>
      </view>
      {this.context.onDone ? this.renderExitButton() : undefined}
    </view>;
  }

  private renderExitButton() {
    if (!this.context.onDone) {
      return;
    }

    <view
      marginTop={16}
      alignSelf="flex-start"
      padding="12 20"
      borderRadius={16}
      backgroundColor="#111827"
      onTap={this.context.onDone}
    >
      <label value="Close playground" color="white" />
    </view>;
  }

  private renderDemoBox(label: string, color: string) {
    <Box contentAlignment="center">
      <view
        width={64}
        height={64}
        backgroundColor={color}
        margin={6}
        borderRadius={20}
        alignItems="center"
        justifyContent="center"
      >
        <label value={label} color="white" />
      </view>
    </Box>;
  }

  private renderTag(label: string) {
    <view
      padding="6 12"
      borderRadius={14}
      margin="4 8 4 0"
      backgroundColor="#e0e7ff"
      alignItems="center"
      justifyContent="center"
    >
      <label value={label} color="#312e81" />
    </view>;
  }

  private handleCycleArrangement = () => {
    const nextIndex = (this.state.arrangementIndex + 1) % ARRANGEMENTS.length;
    this.setState({ arrangementIndex: nextIndex });
  };

  private incrementCounter = () => {
    this.setState({ counter: this.state.counter + 1 });
  };
}
