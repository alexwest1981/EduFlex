package com.eduflex.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles({ "schema-gen", "test" })
class SchemaGenTest {

    @Test
    void contextLoads() {
        // Just loading context triggers schema generation if properties are set
    }
}
