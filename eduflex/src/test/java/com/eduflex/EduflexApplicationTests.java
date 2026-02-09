package com.eduflex;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@org.springframework.test.context.ActiveProfiles("test")
@org.springframework.test.context.TestPropertySource(properties = {
		"spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
		"spring.datasource.driver-class-name=org.h2.Driver",
		"spring.jpa.hibernate.ddl-auto=create-drop",
		"spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
		"spring.jpa.defer-datasource-initialization=true",
		"spring.flyway.enabled=false",
		"spring.jpa.properties.hibernate.multiTenancy=NONE"
})
class EduflexApplicationTests {

	@org.springframework.boot.test.mock.mockito.MockBean
	private com.eduflex.backend.edugame.service.QuestService questService;

	@org.springframework.boot.test.mock.mockito.MockBean
	private com.eduflex.backend.edugame.service.ShopService shopService;

	@org.springframework.boot.test.mock.mockito.MockBean
	private com.eduflex.backend.config.DataInitializer dataInitializer;

	@Test
	void contextLoads() {
	}

}
