package com.eduflex.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles({ "schema-gen", "test" })
@org.springframework.test.context.TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.defer-datasource-initialization=true",
        "spring.flyway.enabled=false"
})
class SchemaGenTest {

    @org.springframework.boot.test.mock.mockito.MockBean
    private com.eduflex.backend.edugame.service.QuestService questService;

    @org.springframework.boot.test.mock.mockito.MockBean
    private com.eduflex.backend.edugame.service.ShopService shopService;

    @org.springframework.boot.test.mock.mockito.MockBean
    private com.eduflex.backend.config.DataInitializer dataInitializer;

    @Test
    void contextLoads() {
        // Just loading context triggers schema generation if properties are set
    }
}
