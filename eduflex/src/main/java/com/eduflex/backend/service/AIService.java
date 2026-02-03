package com.eduflex.backend.service;

import org.springframework.stereotype.Service;

@Service
public class AIService {

    /**
     * Genererar en resurs (quiz, lektion, eller uppgift) baserat på AI-prompt
     * 
     * @param type    Typ av resurs: QUIZ, LESSON, TASK/ASSIGNMENT
     * @param prompt  Användarens beskrivning av vad som ska skapas
     * @param context Extra kontext eller material (valfritt)
     * @return AI-genererat innehåll som sträng
     */
    public String generateResource(String type, String prompt, String context) {
        // TODO: Implementera faktisk AI-integration (t.ex. OpenAI, Gemini, etc.)
        // För nu returnerar vi en enkel placeholder

        String fullPrompt = prompt;
        if (context != null && !context.isEmpty()) {
            fullPrompt += "\n\nKontext: " + context;
        }

        return switch (type.toUpperCase()) {
            case "QUIZ" -> generateQuizPlaceholder(fullPrompt);
            case "LESSON" -> generateLessonPlaceholder(fullPrompt);
            case "TASK", "ASSIGNMENT" -> generateAssignmentPlaceholder(fullPrompt);
            default -> "AI-genererat innehåll för: " + prompt;
        };
    }

    private String generateQuizPlaceholder(String prompt) {
        return "# AI-genererat Quiz\n\n" +
                "Baserat på: " + prompt + "\n\n" +
                "TODO: Implementera faktisk AI-generering av quiz-frågor";
    }

    private String generateLessonPlaceholder(String prompt) {
        return "# " + extractTitle(prompt) + "\n\n" +
                "## Introduktion\n\n" +
                "Detta är en AI-genererad lektion baserat på din beskrivning.\n\n" +
                "## Innehåll\n\n" +
                prompt + "\n\n" +
                "## Sammanfattning\n\n" +
                "TODO: Implementera faktisk AI-generering av lektionsinnehåll";
    }

    private String generateAssignmentPlaceholder(String prompt) {
        return "# AI-genererad Uppgift\n\n" +
                "Baserat på: " + prompt + "\n\n" +
                "TODO: Implementera faktisk AI-generering av uppgifter";
    }

    private String extractTitle(String prompt) {
        // Försök extrahera en titel från prompten
        String[] words = prompt.split("\\s+");
        if (words.length > 5) {
            return String.join(" ", java.util.Arrays.copyOfRange(words, 0, 5)) + "...";
        }
        return prompt.length() > 50 ? prompt.substring(0, 50) + "..." : prompt;
    }
}
