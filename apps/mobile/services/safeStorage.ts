import AsyncStorage from '@react-native-async-storage/async-storage';

const memoryStore = new Map<string, string>();

let storageMode: 'unknown' | 'native' | 'memory' = 'unknown';
let resolvingMode: Promise<'native' | 'memory'> | null = null;

async function resolveStorageMode(): Promise<'native' | 'memory'> {
  if (storageMode !== 'unknown') {
    return storageMode;
  }

  if (!resolvingMode) {
    resolvingMode = (async () => {
      try {
        const probeKey = '__storage_probe__';
        await AsyncStorage.setItem(probeKey, '1');
        await AsyncStorage.removeItem(probeKey);
        storageMode = 'native';
      } catch {
        storageMode = 'memory';
      }

      return storageMode;
    })();
  }

  return resolvingMode;
}

export async function getStorageItem(key: string): Promise<string | null> {
  if ((await resolveStorageMode()) === 'native') {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      storageMode = 'memory';
    }
  }

  return memoryStore.get(key) ?? null;
}

export async function setStorageItem(key: string, value: string): Promise<void> {
  if ((await resolveStorageMode()) === 'native') {
    try {
      await AsyncStorage.setItem(key, value);
      return;
    } catch {
      storageMode = 'memory';
    }
  }

  memoryStore.set(key, value);
}

export async function removeStorageItem(key: string): Promise<void> {
  if ((await resolveStorageMode()) === 'native') {
    try {
      await AsyncStorage.removeItem(key);
      return;
    } catch {
      storageMode = 'memory';
    }
  }

  memoryStore.delete(key);
}
