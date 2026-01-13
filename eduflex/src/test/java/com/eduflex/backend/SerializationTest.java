package com.eduflex.backend;

import com.eduflex.backend.config.WebConfig;
import com.eduflex.backend.model.Quiz;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = { WebConfig.class })
public class SerializationTest {

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testQuizDeserialization() throws Exception {
        String json = "{\n" +
                "  \"title\": \"Test Quiz\",\n" +
                "  \"description\": \"A test quiz\",\n" +
                "  \"questions\": [\n" +
                "    {\n" +
                "      \"text\": \"What is 1+1?\",\n" +
                "      \"options\": [\n" +
                "        { \"text\": \"2\", \"isCorrect\": true },\n" +
                "        { \"text\": \"3\", \"isCorrect\": false }\n" +
                "      ]\n" +
                "    }\n" +
                "  ]\n" +
                "}";

        System.out.println("Testing deserialization with ObjectMapper details: "
                + objectMapper.getDeserializationConfig().getDefaultTyper(null));
        Quiz quiz = objectMapper.readValue(json, Quiz.class);
        assertNotNull(quiz);
        System.out.println("Deserialized Quiz Title: " + quiz.getTitle());
    }
}
