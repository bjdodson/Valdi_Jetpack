# State ownership on Valdi 0.1.1

Jetpack no longer exports the previous `remember(factory)` placeholder. That
function invoked its factory on every call and retained nothing, so its name
promised lifecycle behavior that it could not provide.

This is an intentional source-level compatibility break. The repository has
not published the placeholder as a versioned package, and silently preserving
incorrect state semantics would be riskier than removing it before wider use.

The official Valdi 0.1.1 migration guide states that Valdi has no hooks or
`remember`. Durable component-local state belongs in a `StatefulComponent` and
changes through `setState`:

```tsx
import { StatefulComponent } from "valdi_core/src/Component";

interface CounterState {
  count: number;
}

class Counter extends StatefulComponent<object, CounterState> {
  state: CounterState = { count: 0 };

  private increment = () => {
    this.setState({ count: this.state.count + 1 });
  };

  onRender(): void {
    <view onTap={this.increment} />;
  }
}
```

Reusable Jetpack controls continue to prefer controlled ownership: the caller
passes `value` and an `onValueChange` callback. Components may own transient UI
state, such as whether a `Select` menu is expanded, when that state is strictly
internal to rendering and interaction.

Upstream references, pinned to the adopted release commit:

- [Compose migration: state and hooks](https://github.com/Snapchat/Valdi/blob/41d6d87643e0b9f9dcd8d7b7c162cf0ac7c969a2/docs/docs/migrate-from-compose.md#state-and-hooks)
- [`StatefulComponent` implementation](https://github.com/Snapchat/Valdi/blob/41d6d87643e0b9f9dcd8d7b7c162cf0ac7c969a2/src/valdi_modules/src/valdi/valdi_core/src/Component.ts)
