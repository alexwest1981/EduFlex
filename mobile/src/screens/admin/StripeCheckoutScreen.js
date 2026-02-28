import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CreditCard, CheckCircle, X } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const StripeCheckoutScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { itemName = "Premium Resurs", price = "149 kr" } = route.params || {};

    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handlePayment = () => {
        setIsProcessing(true);
        // Simulate a network request to Stripe backend
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
        }, 2000);
    };

    if (isSuccess) {
        return (
            <View style={styles.centerContainer}>
                <CheckCircle color="#10b981" size={64} style={{ marginBottom: 20 }} />
                <Text style={styles.title}>Betalning Genomförd!</Text>
                <Text style={styles.subtitle}>Du har nu köpt: {itemName}</Text>
                <TouchableOpacity style={[styles.button, { marginTop: 30, backgroundColor: '#00F5FF' }]} onPress={() => navigation.goBack()}>
                    <Text style={styles.buttonText}>Tillbaka till Biblioteket</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <X color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Säker Betalning</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.summaryCard}>
                <Text style={styles.itemName}>{itemName}</Text>
                <Text style={styles.price}>{price}</Text>
            </View>

            <View style={styles.stripePlaceholder}>
                <CreditCard color="#888" size={32} style={{ marginBottom: 10 }} />
                <Text style={styles.stripeText}>[Stripe Payment Element Placeholder]</Text>
                <Text style={styles.stripeNote}>Denna vy integreras med @stripe/stripe-react-native i en framtida uppdatering när Stripe-nycklar är inlagda.</Text>
            </View>

            <TouchableOpacity
                style={styles.payButton}
                onPress={handlePayment}
                disabled={isProcessing}
            >
                {isProcessing ? <ActivityIndicator color="#fff" /> : <Text style={styles.payButtonText}>Betala med Stripe ({price})</Text>}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    centerContainer: { flex: 1, backgroundColor: '#0f1012', justifyContent: 'center', alignItems: 'center', padding: 20 },
    container: { flex: 1, backgroundColor: '#0f1012', padding: 20, paddingTop: 60 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    closeBtn: { padding: 5 },
    summaryCard: { backgroundColor: '#1a1b1d', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#333', marginBottom: 24, alignItems: 'center' },
    itemName: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
    price: { color: '#00F5FF', fontSize: 24, fontWeight: 'bold' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#888' },
    stripePlaceholder: { backgroundColor: '#1a1b1d', padding: 30, borderRadius: 16, borderWidth: 1, borderColor: '#333', alignItems: 'center', marginBottom: 30 },
    stripeText: { color: '#888', fontWeight: 'bold', marginBottom: 10 },
    stripeNote: { color: '#666', fontSize: 12, textAlign: 'center' },
    payButton: { backgroundColor: '#635BFF', padding: 18, borderRadius: 12, alignItems: 'center' },
    payButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    button: { padding: 16, borderRadius: 12, alignItems: 'center' },
    buttonText: { color: '#000', fontWeight: 'bold', fontSize: 16 }
});

export default StripeCheckoutScreen;
