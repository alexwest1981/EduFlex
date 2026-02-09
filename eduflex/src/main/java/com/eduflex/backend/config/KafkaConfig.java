package com.eduflex.backend.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "spring.kafka.enabled", havingValue = "true")
public class KafkaConfig {

    public static final String DOCUMENT_UPLOADED_TOPIC = "eduflex.documents.uploaded";

    @Bean
    public NewTopic documentUploadedTopic() {
        return TopicBuilder.name(DOCUMENT_UPLOADED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
