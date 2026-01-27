package com.eduflex.backend.service;

import com.eduflex.backend.model.LtiPlatform;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class LtiTest {
    @Test
    void testVisibility() {
        LtiPlatform platform = new LtiPlatform();
        assertNotNull(platform);
    }
}
