import { Component, type ReactNode } from 'react';
import { DevSettings, Pressable, Text, View } from 'react-native';
import { reportError } from '../services/telemetry';

type State = { failed: boolean };

/** Якщо екран впав — показуємо зрозуміле повідомлення замість білого екрана і надсилаємо звіт */
export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    reportError(error, true);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: '#F5F5F7' }}>
        <Text style={{ fontSize: 26, fontWeight: '700', color: '#1D1D1F', textAlign: 'center' }}>Щось пішло не так</Text>
        <Text style={{ marginTop: 8, fontSize: 16, lineHeight: 23, color: '#6E6E73', textAlign: 'center' }}>
          Ми вже отримали звіт і виправимо. Ваш кошик і обране збережені.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => (__DEV__ ? DevSettings.reload() : this.setState({ failed: false }))}
          style={{ marginTop: 26, height: 52, paddingHorizontal: 28, borderRadius: 26, backgroundColor: '#138A47', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 17, fontWeight: '600', color: '#FFFFFF' }}>Спробувати ще раз</Text>
        </Pressable>
      </View>
    );
  }
}
