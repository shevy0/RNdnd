import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MainScreen from './screens/MainScreen';
import {Host} from 'react-native-portalize';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Host>
        <Stack.Navigator>
          <Stack.Screen name="MainScreen" component={MainScreen} />
        </Stack.Navigator>
      </Host>
    </NavigationContainer>
  );
}

export default App;
