package com.triagenet.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class MnemonicRecoveryServiceTest {

    private MnemonicRecoveryService mnemonicRecoveryService;

    @BeforeEach
    void setUp() {
        mnemonicRecoveryService = new MnemonicRecoveryService();
    }

    @Test
    @DisplayName("Should generate valid 12-word recovery mnemonic")
    void testGenerateMnemonic() {
        String mnemonic = mnemonicRecoveryService.generateMnemonic();
        assertNotNull(mnemonic);

        String[] words = mnemonic.split("\\s+");
        assertEquals(12, words.length, "Mnemonic must consist of exactly 12 words");
        for (String word : words) {
            assertTrue(word.length() >= 3, "Each word should be meaningful");
        }
    }

    @Test
    @DisplayName("Should generate 8 emergency backup codes formatted as TR-XXXX-XXXX")
    void testGenerateBackupCodes() {
        List<String> codes = mnemonicRecoveryService.generateBackupCodes();
        assertNotNull(codes);
        assertEquals(8, codes.size());

        for (String code : codes) {
            assertTrue(code.matches("^TR-[A-Z0-9]{4}-[A-Z0-9]{4}$"),
                    "Code format must match TR-XXXX-XXXX: " + code);
        }
    }

    @Test
    @DisplayName("Should verify mnemonic phrase against its salted SHA-256 hash")
    void testVerifyMnemonic() {
        String phrase = "matrix clinic pulse shelter doctor orbit copper shield river canyon alert beacon";
        String hash = mnemonicRecoveryService.hashMnemonic(phrase);

        assertNotNull(hash);
        assertEquals(64, hash.length(), "SHA-256 hash must be 64 hex characters");

        // Verify exact match
        assertTrue(mnemonicRecoveryService.verifyMnemonic(phrase, hash));

        // Verify case and whitespace insensitivity
        assertTrue(mnemonicRecoveryService.verifyMnemonic("  MATRIX clinic  PULSE shelter doctor orbit copper shield river canyon alert beacon ", hash));

        // Verify altered phrase fails
        assertFalse(mnemonicRecoveryService.verifyMnemonic("matrix clinic pulse shelter doctor orbit copper shield river canyon alert wrong", hash));
    }
}
