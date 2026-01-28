package com.eduflex.video.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;

import com.eduflex.video.service.VideoEventListener;

@Configuration
public class RedisConfig {

    @Bean
    ChannelTopic topic() {
        return new ChannelTopic("video.upload");
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
    MessageListenerAdapter listenerAdapter(VideoEventListener receiver) {
        return new MessageListenerAdapter(receiver, "receiveMessage");
    }
}
