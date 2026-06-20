import React from 'react';
import { View, StyleSheet, FlatList, SafeAreaView, StatusBar } from 'react-native';
import { Header } from '../components/Header';
import { CategoryCard } from '../components/CategoryCard';
import { COLORS, SPACING } from '../theme/theme';

const CATEGORIES = [
  'Tools',
  'Electrical',
  'Plumbing',
  'Paint',
  'Fasteners',
  'Safety Equipment'
];

export const CategoriesScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
      <Header title="Product Categories" showLogo={false} showSearch={false} showCart={true} />

      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item}
        renderItem={({ item }) => <CategoryCard category={item} />}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  listContainer: {
    padding: SPACING.sm,
  },
});
