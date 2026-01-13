package com.eduflex.backend.serialization;

import com.eduflex.backend.model.Quiz;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class QuizSerializationTest {

    @Test
    public void testDeserialization() throws Exception {
        String json = "{\"title\":\"Test Quiz\",\"description\":\"Desc\",\"questions\":[{\"text\":\"Q1\",\"options\":[{\"text\":\"Opt1\",\"isCorrect\":true}]}]}";

        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);

        System.out.println("Starting deserialization test...");
        try {
            Quiz quiz = mapper.readValue(json, Quiz.class);
            assertNotNull(quiz);
            assertEquals("Test Quiz", quiz.getTitle());
            assertNotNull(quiz.getQuestions());
            assertEquals(1, quiz.getQuestions().size());
            assertEquals("Q1", quiz.getQuestions().get(0).getText());
            System.out.println("Deserialization successful!");
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }
}
