package com.eduflex.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles({ "schema-gen", "test" })
@org.springframework.test.context.TestPropertySource(properties = {
        "spring.flyway.enabled=false"
})
class SchemaGenTest {

    @org.springframework.boot.test.mock.mockito.MockBean
    private com.eduflex.backend.edugame.service.QuestService questService;

    @org.springframework.boot.test.mock.mockito.MockBean
    private com.eduflex.backend.edugame.service.ShopService shopService;

    @org.springframework.boot.test.mock.mockito.MockBean
    private com.eduflex.backend.config.DataInitializer dataInitializer;

    @org.springframework.boot.test.mock.mockito.MockBean
    private org.springframework.mail.javamail.JavaMailSender mailSender;

    @Test
    void contextLoads() {
        // Just loading context triggers schema generation if properties are set
    }
}
