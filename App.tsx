import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MainScreen from './screens/MainScreen';
import {Host} from 'react-native-portalize';
import {AppProvider} from './common/context/AppContext';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <Host>
          <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="MainScreen" component={MainScreen} />
          </Stack.Navigator>
        </Host>
      </NavigationContainer>
    </AppProvider>
  );
}

export default App;
