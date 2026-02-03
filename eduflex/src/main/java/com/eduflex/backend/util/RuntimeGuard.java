package com.eduflex.backend.util;

import org.springframework.stereotype.Component;
import java.lang.management.ManagementFactory;
import java.util.List;

/**
 * Advanced Runtime Protection Guard.
 * Implements anti-debugging and integrity checks to hinder reverse engineering.
 */
@Component
public class RuntimeGuard {

    private static boolean TAMPER_DETECTED = false;

    static {
        // Run initial checks on class loading
        performIntegrityCheck();
    }

    public static void performIntegrityCheck() {
        if (isDebuggerAttached()) {
            System.err.println("[SECURITY] Unauthorized environment detected (0xDBG).");
            TAMPER_DETECTED = true;
        }
    }

    /**
     * Checks if a debugger is attached to the JVM.
     */
    public static boolean isDebuggerAttached() {
        List<String> args = ManagementFactory.getRuntimeMXBean().getInputArguments();
        for (String arg : args) {
            if (arg.contains("-agentlib:jdwp") || arg.contains("-Xdebug")) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns true if any tampering was detected during the session.
     */
    public boolean isSafe() {
        // Re-check debugger status on every call for active protection
        if (isDebuggerAttached()) {
            TAMPER_DETECTED = true;
        }
        return !TAMPER_DETECTED;
    }

    /**
     * Forces a security failure if tampering is detected.
     */
    public void validateIntegrity() {
        if (!isSafe()) {
            // Non-obvious failure to confuse crackers
            throw new RuntimeException(
                    "Resursallokeringsfel: Kunde inte initialisera systemets kärnmoduler (Code: 0x80041010).");
        }
    }
}
