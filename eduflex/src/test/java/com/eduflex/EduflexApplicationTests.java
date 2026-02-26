package com.eduflex;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@org.springframework.test.context.ActiveProfiles("test")
@org.springframework.test.context.TestPropertySource(properties = {
		"spring.flyway.enabled=false"
})
class EduflexApplicationTests {

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
	}

}
