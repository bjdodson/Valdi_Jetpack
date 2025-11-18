import { StatefulComponent } from 'valdi_core/src/Component';
import { Row, Column, Box, Text } from 'compose_core/src/index';
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

    <Box>
      <scroll backgroundColor="#f5f5f7">
        <Box style={{ padding: "32 24 48 24", minHeight: "100%" }}>
          <Text text="Valdi Compose Playground" color="#0f172a" accessibilityLabel="Valdi Compose Playground heading" />
          <Text text="Small showcase powered by compose_core primitives." style={{ marginTop: 8 }} color="#475467" />
          <Box style={{ marginTop: 32 }}>
            {this.renderRowDemo(arrangement)}
            {this.renderColumnDemo()}
            {this.renderStateDemo()}
          </Box>
        </Box>
      </scroll>
    </Box>;
  }

  private renderRowDemo(arrangement: ArrangementOption) {
    <Box
      style={{
        backgroundColor: "white",
        padding: "20",
        borderRadius: 28,
        marginBottom: 24,
        boxShadow: "0 18 48 rgba(15, 23, 42, 0.08)",
      }}
    >
      <Text text="Row layout" color="#0f172a" />
      <Text text={`horizontalArrangement: ${arrangement.label}`} style={{ marginTop: 4 }} color="#475467" />
      <Box
        style={{
          marginTop: 12,
          padding: "10 16",
          borderRadius: 999,
          backgroundColor: "#111827",
          alignSelf: "flex-start",
        }}
        onTap={this.handleCycleArrangement}
      >
        <Text color="white" text="Tap to cycle alignment" />
      </Box>
      <Row horizontalArrangement={arrangement.value} verticalAlignment="center">
        {BOX_COLORS.forEach((color, index) => {
          this.renderDemoBox(String.fromCharCode(65 + index), color);
        })}
      </Row>
    </Box>;
  }

  private renderColumnDemo() {
    <Box
      style={{
        backgroundColor: "white",
        padding: "20",
        borderRadius: 28,
        marginBottom: 24,
        boxShadow: "0 18 48 rgba(15, 23, 42, 0.08)",
      }}
    >
      <Text text="Column layout" color="#0f172a" />
      <Text text="horizontalAlignment: stretch" style={{ marginTop: 4 }} color="#475467" />
      <Column horizontalAlignment="stretch" verticalArrangement="flex-start">
        {FEATURE_GROUPS.forEach(group => {
          <Box
            style={{
              backgroundColor: "#f9fafb",
              padding: "12 16",
              borderRadius: 18,
              marginTop: 12,
            }}
          >
            <Text text={group.title} color="#0f172a" />
            <Box style={{ marginTop: 8 }}>
              <Row horizontalArrangement="flex-start" verticalAlignment="center" wrap="wrap">
                {group.tags.forEach(tag => {
                  this.renderTag(tag);
                })}
              </Row>
            </Box>
          </Box>;
        })}
      </Column>
    </Box>;
  }

  private renderStateDemo() {
    <Box
      style={{
        backgroundColor: "white",
        padding: "20",
        borderRadius: 28,
        marginBottom: 24,
        boxShadow: "0 18 48 rgba(15, 23, 42, 0.08)",
      }}
    >
      <Text text="Stateful components" color="#0f172a" />
      <Text text="StatefulComponent + setState demo" style={{ marginTop: 4 }} color="#475467" />
      <Box style={{ marginTop: 16 }}>
        <Row horizontalArrangement="flex-start" verticalAlignment="center" wrap="wrap">
          <Box contentAlignment="center">
            <Box
              style={{
                margin: "4 12 4 0",
                padding: "14 18",
                borderRadius: 22,
                backgroundColor: "#1d4ed8",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text text={`Counter: ${this.state.counter}`} color="white" />
            </Box>
          </Box>
          <Box
            style={{
              margin: "4 12 4 0",
              padding: "12 18",
              borderRadius: 999,
              backgroundColor: "#dbeafe",
              alignItems: "center",
            }}
            onTap={this.incrementCounter}
          >
            <Text text="Tap to increment" color="#1d4ed8" />
          </Box>
        </Row>
      </Box>
      {this.context.onDone ? this.renderExitButton() : undefined}
    </Box>;
  }

  private renderExitButton() {
    if (!this.context.onDone) {
      return;
    }

    <Box
      style={{
        marginTop: 16,
        alignSelf: "flex-start",
        padding: "12 20",
        borderRadius: 16,
        backgroundColor: "#111827",
      }}
      onTap={this.context.onDone}
    >
      <Text text="Close playground" color="white" />
    </Box>;
  }

  private renderDemoBox(label: string, color: string) {
    <Box contentAlignment="center">
      <Box
        style={{
          width: 64,
          height: 64,
          backgroundColor: color,
          margin: 6,
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text text={label} color="white" />
      </Box>
    </Box>;
  }

  private renderTag(label: string) {
    <Box
      style={{
        padding: "6 12",
        borderRadius: 14,
        margin: "4 8 4 0",
        backgroundColor: "#e0e7ff",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text text={label} color="#312e81" />
    </Box>;
  }

  private handleCycleArrangement = () => {
    const nextIndex = (this.state.arrangementIndex + 1) % ARRANGEMENTS.length;
    this.setState({ arrangementIndex: nextIndex });
  };

  private incrementCounter = () => {
    this.setState({ counter: this.state.counter + 1 });
  };
}
