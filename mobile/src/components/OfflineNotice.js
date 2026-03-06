import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const OfflineNotice = () => {
    const [isConnected, setIsConnected] = useState(true);
    const animationValue = new Animated.Value(0);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const status = state.isConnected && state.isInternetReachable;
            if (status !== isConnected) {
                setIsConnected(status);
                Animated.timing(animationValue, {
                    toValue: status ? 0 : 1,
                    duration: 400,
                    useNativeDriver: true,
                }).start();
            }
        });

        return () => unsubscribe();
    }, [isConnected]);

    if (isConnected && animationValue._value === 0) return null;

    const translateY = animationValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-100, 0],
    });

    return (
        <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
            <View style={styles.content}>
                <WifiOff size={20} color="#fff" style={styles.icon} />
                <Text style={styles.text}>Du är offline. Ändringar sparas lokalt och synkas senare.</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50,
        width: width - 40,
        left: 20,
        backgroundColor: '#FF4B4B',
        borderRadius: 12,
        zIndex: 9999,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    icon: {
        marginRight: 10,
    },
    text: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
});

export default OfflineNotice;
