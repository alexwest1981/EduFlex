import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useThemedStyles } from '../../hooks';

const InboxScreen: React.FC = () => {
  const { colors, styles: themedStyles } = useThemedStyles();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    placeholder: {
      fontSize: 18,
      color: colors.textSecondary,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>💬 Meddelanden kommer snart</Text>
    </View>
  );
};

export default InboxScreen;
