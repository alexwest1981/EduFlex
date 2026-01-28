package com.eduflex.pdf.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;

import com.eduflex.pdf.service.PdfEventListener;

@Configuration
public class RedisConfig {

    @Bean
    ChannelTopic topic() {
        return new ChannelTopic("pdf.upload");
    }

    @Bean
    RedisMessageListenerContainer redisContainer(RedisConnectionFactory connectionFactory,
            MessageListenerAdapter listenerAdapter) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(listenerAdapter, topic());
        return container;
    }

    @Bean
    MessageListenerAdapter listenerAdapter(PdfEventListener receiver) {
        return new MessageListenerAdapter(receiver, "receiveMessage");
    }
}
