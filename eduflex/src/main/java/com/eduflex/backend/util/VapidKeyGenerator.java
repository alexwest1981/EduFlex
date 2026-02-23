package com.eduflex.backend.util;

import org.bouncycastle.jce.provider.BouncyCastleProvider;

import java.security.*;
import java.security.spec.ECGenParameterSpec;

/**
 * Utility class to generate VAPID keys for PWA Push Notifications.
 * Uses BouncyCastle for EC key generation on secp256r1 curve.
 */
public class VapidKeyGenerator {
    public static void main(String[] args) throws Exception {
        Security.addProvider(new BouncyCastleProvider());

        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("ECDH", "BC");
        keyPairGenerator.initialize(new ECGenParameterSpec("secp256r1"));
        KeyPair keyPair = keyPairGenerator.generateKeyPair();

        // Use BouncyCastle-specific interface to get the Q point and D value
        org.bouncycastle.jce.interfaces.ECPublicKey publicKey = (org.bouncycastle.jce.interfaces.ECPublicKey) keyPair
                .getPublic();
        org.bouncycastle.jce.interfaces.ECPrivateKey privateKey = (org.bouncycastle.jce.interfaces.ECPrivateKey) keyPair
                .getPrivate();

        // VAPID keys are the raw uncompressed bytes of the public key (65 bytes)
        // and the raw D value of the private key (32 bytes).
        byte[] publicKeyBytes = publicKey.getQ().getEncoded(false);
        // In BouncyCastle ECPrivateKey, the private value is getD()
        byte[] privateKeyBytes = privateKey.getD().toByteArray();

        // Fix private key length if it has a leading zero byte due to sign bit (from
        // D.toByteArray())
        if (privateKeyBytes.length == 33 && privateKeyBytes[0] == 0) {
            byte[] tmp = new byte[32];
            System.arraycopy(privateKeyBytes, 1, tmp, 0, 32);
            privateKeyBytes = tmp;
        } else if (privateKeyBytes.length < 32) {
            byte[] tmp = new byte[32];
            System.arraycopy(privateKeyBytes, 0, tmp, 32 - privateKeyBytes.length, privateKeyBytes.length);
            privateKeyBytes = tmp;
        }

        System.out.println("--- VAPID KEYS GENERATED ---");
        System.out.println("Public Key (use in application.properties & frontend):");
        System.out.println(java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(publicKeyBytes));
        System.out.println("\nPrivate Key (use in application.properties):");
        System.out.println(java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(privateKeyBytes));
        System.out.println("----------------------------");
    }
}
