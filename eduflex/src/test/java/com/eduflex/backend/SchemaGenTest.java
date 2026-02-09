package com.eduflex.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles({ "schema-gen", "test" })
class SchemaGenTest {

    @org.springframework.boot.test.mock.mockito.MockBean
    private com.eduflex.backend.edugame.service.QuestService questService;

    @Test
    void contextLoads() {
        // Just loading context triggers schema generation if properties are set
    }
}
