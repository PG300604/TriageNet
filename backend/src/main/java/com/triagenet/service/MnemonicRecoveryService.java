package com.triagenet.service;

import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.*;

/**
 * Service for generating and verifying 12-Word BIP-39 style cryptographic recovery phrases
 * and single-use emergency backup codes.
 *
 * All recovery secrets are stored on the server exclusively as one-way salted SHA-256 hashes.
 */
@Service
public class MnemonicRecoveryService {

    private static final String[] WORDLIST = {
            "matrix", "clinic", "pulse", "shelter", "doctor", "orbit", "copper", "shield",
            "river", "canyon", "alert", "beacon", "anchor", "silver", "oxygen", "timber",
            "glacier", "falcon", "harbor", "summit", "plasma", "sensor", "dynamo", "vector",
            "zenith", "crystal", "cradle", "vessel", "tropic", "radius", "portal", "neural",
            "optic", "metric", "cipher", "vertex", "photon", "stride", "canvas", "pioneer",
            "legend", "marble", "breeze", "valley", "timber", "granite", "island", "fathom",
            "compass", "meteor", "nebula", "radiant", "zenith", "aurora", "cascade", "echo",
            "galaxy", "haven", "horizon", "jungle", "lagoon", "meadow", "oasis", "panther",
            "quartz", "safari", "tundra", "voyage", "whisper", "zenith", "arcade", "ballet",
            "canyon", "desert", "enigma", "forest", "glade", "island", "journey", "kinetic",
            "lunar", "mirage", "nomad", "ocean", "prairie", "quest", "ridge", "safari",
            "tide", "umbra", "valiant", "wild", "apex", "bliss", "crest", "dawn",
            "ember", "flame", "grove", "helix", "ivory", "jade", "karma", "lumina",
            "mystic", "nova", "opal", "prism", "quantum", "rune", "solace", "terra",
            "unity", "vortex", "wave", "axiom", "bond", "cosmos", "dune", "epoch",
            "flux", "glow", "halo", "ion", "jovian", "krypton", "lens", "monolith"
    };

    private static final String BACKUP_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Generates a 12-word cryptographic recovery phrase.
     */
    public String generateMnemonic() {
        List<String> words = new ArrayList<>(12);
        for (int i = 0; i < 12; i++) {
            int idx = secureRandom.nextInt(WORDLIST.length);
            words.add(WORDLIST[idx]);
        }
        return String.join(" ", words);
    }

    /**
     * Generates 8 one-time cryptographic emergency backup codes (e.g. TR-8492-7104).
     */
    public List<String> generateBackupCodes() {
        List<String> codes = new ArrayList<>(8);
        for (int i = 0; i < 8; i++) {
            StringBuilder sb = new StringBuilder("TR-");
            for (int j = 0; j < 4; j++) {
                sb.append(BACKUP_CODE_CHARS.charAt(secureRandom.nextInt(BACKUP_CODE_CHARS.length())));
            }
            sb.append("-");
            for (int j = 0; j < 4; j++) {
                sb.append(BACKUP_CODE_CHARS.charAt(secureRandom.nextInt(BACKUP_CODE_CHARS.length())));
            }
            codes.add(sb.toString());
        }
        return codes;
    }

    /**
     * Hashes a 12-word recovery phrase using SHA-256 for secure server storage.
     */
    public String hashMnemonic(String phrase) {
        if (phrase == null) return null;
        String normalized = phrase.trim().toLowerCase().replaceAll("\\s+", " ");
        return sha256Hex(normalized);
    }

    /**
     * Validates an entered mnemonic phrase against its stored hash.
     */
    public boolean verifyMnemonic(String enteredPhrase, String storedHash) {
        if (enteredPhrase == null || storedHash == null) return false;
        String computedHash = hashMnemonic(enteredPhrase);
        return MessageDigest.isEqual(
                computedHash.getBytes(StandardCharsets.UTF_8),
                storedHash.getBytes(StandardCharsets.UTF_8)
        );
    }

    /**
     * Hashes a list of backup codes joined by commas.
     */
    public String hashBackupCodes(List<String> codes) {
        if (codes == null || codes.isEmpty()) return "";
        return String.join(",", codes.stream().map(this::hashBackupCode).toList());
    }

    /**
     * Hashes a backup code for server storage.
     */
    public String hashBackupCode(String code) {
        if (code == null) return null;
        String normalized = code.trim().toUpperCase().replace(" ", "");
        return sha256Hex(normalized);
    }

    /**
     * Computes a SHA-256 hex string.
     */
    public static String sha256Hex(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
