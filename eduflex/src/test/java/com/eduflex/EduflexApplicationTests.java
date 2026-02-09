package com.eduflex;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@org.springframework.test.context.ActiveProfiles("test")
class EduflexApplicationTests {

	@org.springframework.boot.test.mock.mockito.MockBean
	private com.eduflex.backend.edugame.service.QuestService questService;

	@Test
	void contextLoads() {
	}

}
