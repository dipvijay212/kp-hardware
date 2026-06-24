import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CartProvider } from './src/context/CartContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { CustomAlert } from './src/components/CustomAlert';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <CartProvider>
        <AppNavigator />
        <CustomAlert />
      </CartProvider>
    </SafeAreaProvider>
  );
}

export default App;

