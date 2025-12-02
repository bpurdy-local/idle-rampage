import React, {useEffect, useState} from 'react';
import {StatusBar, View, Text, StyleSheet} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GameScreen} from './src/screens/GameScreen';
import {LoadingScreen} from './src/components/game/LoadingScreen';
import {saveService} from './src/services/SaveService';
import {useGameStore} from './src/stores/gameStore';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGame = async () => {
      try {
        // Simulate loading stages for visual feedback
        setLoadingProgress(0.2);

        const result = await saveService.load();
        setLoadingProgress(0.6);

        if (result.success && result.gameState) {
          // Restore game state to store
          const store = useGameStore.getState();
          store.setScrap(result.gameState.player.scrap);
          store.setBlueprints(result.gameState.player.blueprints);
          // Note: Full state restoration would need more actions in the store

          if (result.wasOffline && result.offlineTime) {
            // Could calculate offline earnings here
            console.log(`Was offline for ${Math.floor(result.offlineTime / 1000)}s`);
          }
        }

        setLoadingProgress(1);

        // Brief delay to show completed state
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      } catch {
        setError('Failed to load game');
        setIsLoading(false);
      }
    };

    loadGame();
  }, []);

  if (isLoading) {
    return <LoadingScreen progress={loadingProgress} />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f1a" />
      <GameScreen />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#f44336',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default App;
