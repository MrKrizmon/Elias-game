import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DEFAULT_WORDS } from './src/data/words';
import { loadCustomWords, saveCustomWords } from './src/utils/storage';

import HomeScreen from './src/screens/HomeScreen';
import RulesScreen from './src/screens/RulesScreen';
import WordsScreen from './src/screens/WordsScreen';
import SetupScreen from './src/screens/SetupScreen';
import GameScreen from './src/screens/GameScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [customWords, setCustomWordsState] = useState([]);

  useEffect(() => {
    loadCustomWords().then(w => setCustomWordsState(w));
  }, []);

  function setCustomWords(updater) {
    setCustomWordsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveCustomWords(next);
      return next;
    });
  }

  const allWordCount = DEFAULT_WORDS.length + customWords.length;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="Home">
            {props => <HomeScreen {...props} wordCount={allWordCount} />}
          </Stack.Screen>
          <Stack.Screen name="Rules" component={RulesScreen} />
          <Stack.Screen name="Words">
            {props => <WordsScreen {...props} customWords={customWords} setCustomWords={setCustomWords} />}
          </Stack.Screen>
          <Stack.Screen name="Setup">
            {props => (
              <SetupScreen {...props} onStartGame={(config) => props.navigation.navigate('Game', config)} />
            )}
          </Stack.Screen>
          <Stack.Screen name="Game">
            {props => <GameScreen {...props} customWords={customWords} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
