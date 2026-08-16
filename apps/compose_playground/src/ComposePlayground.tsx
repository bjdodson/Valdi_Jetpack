import { StatefulComponent } from 'valdi_core/src/Component';
import { systemBoldFont } from 'valdi_core/src/SystemFont';
import {
  Box,
  Button,
  Column,
  LazyGrid,
  Row,
  SegmentedControl,
  Select,
  Slider,
  TabBar,
  Text,
  TextField,
  Toggle,
} from 'compose_core/src/index';
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
  density: string;
  enabled: boolean;
  outputFormat: string;
  progress: number;
  selectedTab: string;
  submittedName: string;
  textValue: string;
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

const DENSITY_OPTIONS = [
  { label: 'Compact', value: 'compact' },
  { label: 'Comfortable', value: 'comfortable' },
  { label: 'Spacious', value: 'spacious' },
];

const FORMAT_OPTIONS = [
  { label: 'PNG', value: 'png' },
  { label: 'JPEG', value: 'jpeg' },
  { label: 'TIFF (unavailable)', value: 'tiff', disabled: true },
];

const TAB_OPTIONS = [
  { label: 'Inputs', value: 'inputs' },
  { label: 'Preview', value: 'preview' },
  { label: 'Disabled', value: 'disabled', disabled: true },
];

const GRID_ITEMS = [
  '01', '02', '03', '04', '05', '06',
  '07', '08', '09', '10', '11', '12',
  '13', '14', '15', '16', '17', '18',
  '19', '20', '21', '22', '23', '24',
];

/**
 * @Component
 * @ExportModel({ ios: 'VLComposePlaygroundView', android: 'com.snap.valdi.composeplayground.ComposePlaygroundView' })
 */
export class ComposePlayground extends StatefulComponent<ComposePlaygroundViewModel, ComposePlaygroundState, ComposePlaygroundContext> {
  state: ComposePlaygroundState = {
    arrangementIndex: 0,
    counter: 0,
    density: 'comfortable',
    enabled: true,
    outputFormat: 'png',
    progress: 35,
    selectedTab: 'inputs',
    submittedName: '',
    textValue: 'Compose sample',
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
            {this.renderControlledControlsDemo()}
            {this.renderLazyGridDemo()}
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

  private renderControlledControlsDemo() {
    <Box
      style={{
        backgroundColor: 'white',
        padding: '20',
        borderRadius: 28,
        marginBottom: 24,
        boxShadow: '0 18 48 rgba(15, 23, 42, 0.08)',
      }}
    >
      <Text text="Controlled inputs" color="#0f172a" />
      <Text
        text="The parent owns every value; controls emit change requests. Neutral tokens are the default."
        style={{ marginTop: 4 }}
        color="#475467"
      />

      <Box style={{ marginTop: 18 }}>
        <Text text="Button" color="#0f172a" />
        <Row horizontalArrangement="flex-start" verticalAlignment="center" wrap="wrap">
          <Box style={{ margin: '8 8 0 0' }}>
            <Button label={`Pressed ${this.state.counter}`} onPress={this.incrementCounter} />
          </Box>
          <Box style={{ margin: '8 8 0 0' }}>
            <Button label="Secondary" tone="secondary" onPress={this.incrementCounter} />
          </Box>
          <Box style={{ margin: '8 8 0 0' }}>
            <Button label="Disabled" disabled={true} onPress={this.incrementCounter} />
          </Box>
        </Row>
      </Box>

      <Box style={{ marginTop: 18 }}>
        <Slider
          label="Progress"
          valueLabel={`${this.state.progress}%`}
          value={this.state.progress}
          min={0}
          max={100}
          step={5}
          onValueChange={this.handleProgressChange}
          onValueChangeFinished={this.handleProgressCommit}
        />
      </Box>

      <Box style={{ marginTop: 18 }}>
        <Text text="Density" color="#0f172a" />
        <Box style={{ marginTop: 8 }}>
          <SegmentedControl
            options={DENSITY_OPTIONS}
            value={this.state.density}
            onValueChange={this.handleDensityChange}
          />
        </Box>
      </Box>

      <Box style={{ marginTop: 18 }}>
        <Toggle
          checked={this.state.enabled}
          label="Enable live preview"
          supportingText="Per-control theme overrides can be supplied without changing the shared default."
          theme={{ accent: '#7c3aed', surfaceSelected: '#ede9fe' }}
          onCheckedChange={this.handleEnabledChange}
        />
      </Box>

      <Box style={{ marginTop: 18 }}>
        <Text text="Output format" color="#0f172a" />
        <Box style={{ marginTop: 8 }}>
          <Select
            options={FORMAT_OPTIONS}
            value={this.state.outputFormat}
            onValueChange={this.handleOutputFormatChange}
            accessibilityLabel="Output format"
          />
        </Box>
      </Box>

      <Box style={{ marginTop: 18 }}>
        <TabBar
          options={TAB_OPTIONS}
          value={this.state.selectedTab}
          onValueChange={this.handleTabChange}
          accessibilityLabel="Playground sections"
        />
      </Box>

      <Box style={{ marginTop: 18 }}>
        <Text text="Name" color="#0f172a" />
        <Box style={{ marginTop: 8 }}>
          <TextField
            value={this.state.textValue}
            placeholder="Type a sample name"
            accessibilityLabel="Sample name"
            onValueChange={this.handleTextChange}
            onSubmit={this.handleTextSubmit}
          />
        </Box>
        {this.state.submittedName ? (
          <Text text={`Submitted: ${this.state.submittedName}`} color="#475467" style={{ marginTop: 8 }} />
        ) : undefined}
      </Box>
    </Box>;
  }

  private renderLazyGridDemo(): void {
    <Box
      style={{
        backgroundColor: "white",
        padding: "20",
        borderRadius: 28,
        marginBottom: 24,
        boxShadow: "0 18 48 rgba(15, 23, 42, 0.08)",
      }}
    >
      <Text text="Lazy grid" color="#0f172a" />
      <Text
        text="Responsive columns with a fixed-height, viewport-windowed item set."
        style={{ marginTop: 4, marginBottom: 14 }}
        color="#475467"
      />
      <LazyGrid
        items={GRID_ITEMS}
        renderItem={(item, index) => this.renderGridItem(item, index)}
        keyForItem={item => item}
        minimumItemWidth={128}
        itemHeight={86}
        columnSpacing={10}
        rowSpacing={10}
        overscanRows={1}
        accessibilityLabel="Responsive lazy grid example"
        testTag="compose_playground_lazy_grid"
      />
    </Box>;
  }

  private renderGridItem(item: string, index: number): void {
    <Box
      contentAlignment="center"
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 18,
        backgroundColor: index % 2 === 0 ? "#eef2ff" : "#e0f2fe",
        borderWidth: 1,
        borderColor: index % 2 === 0 ? "#c7d2fe" : "#bae6fd",
      }}
    >
      <Text text={`Item ${item}`} color="#1e3a8a" />
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
        contentAlignment="center"
        style={{
          width: 64,
          height: 64,
          backgroundColor: color,
          margin: 6,
          borderRadius: 20,
        }}
      >
        <Text text={label} color="red" font={systemBoldFont(14)} />
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

  private handleProgressChange = (progress: number) => {
    this.setState({ progress });
  };

  private handleProgressCommit = (progress: number) => {
    console.log(`Slider committed ${progress}`);
  };

  private handleDensityChange = (density: string) => {
    this.setState({ density });
  };

  private handleEnabledChange = (enabled: boolean) => {
    this.setState({ enabled });
  };

  private handleOutputFormatChange = (outputFormat: string) => {
    this.setState({ outputFormat });
  };

  private handleTabChange = (selectedTab: string) => {
    this.setState({ selectedTab });
  };

  private handleTextChange = (textValue: string) => {
    this.setState({ textValue });
  };

  private handleTextSubmit = (submittedName: string) => {
    this.setState({ submittedName });
  };
}
