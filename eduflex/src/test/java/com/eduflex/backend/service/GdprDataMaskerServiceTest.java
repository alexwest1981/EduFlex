package com.eduflex.backend.service;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class GdprDataMaskerServiceTest {

    private final GdprDataMaskerService masker = new GdprDataMaskerService();

    @Test
    public void testMaskEmail() {
        String input = "Kontakta mig på alex@example.com eller support@eduflex.se";
        String expected = "Kontakta mig på [EMAIL_MASKERAD] eller [EMAIL_MASKERAD]";
        assertEquals(expected, masker.maskPii(input));
    }

    @Test
    public void testMaskSsn() {
        String input = "Mitt personnummer är 19900101-1234 och min kollegas är 850505-4321";
        String expected = "Mitt personnummer är [PERSONNUMMER_MASKERAT] och min kollegas är [PERSONNUMMER_MASKERAT]";
        assertEquals(expected, masker.maskPii(input));
    }

    @Test
    public void testMaskPhone() {
        String input = "Ring oss på 070-123 45 67 eller +46 8 500 100 00";
        String expected = "Ring oss på [TELEFON_MASKERAT] eller [TELEFON_MASKERAT]";
        assertEquals(expected, masker.maskPii(input));
    }

    @Test
    public void testPseudonymize() {
        assertEquals("[STUDENT_NAME]", masker.pseudonymize("Alex Weström", "STUDENT"));
        assertEquals("[USER_NAME]", masker.pseudonymize("Admin User", "USER"));
    }
}
