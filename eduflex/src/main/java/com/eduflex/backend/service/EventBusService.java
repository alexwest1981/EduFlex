package com.eduflex.backend.service;

/**
 * Interface for system-wide event communication.
 * Allows decoupling of services and supports multi-node scalability.
 */
public interface EventBusService {

    /**
     * Publishes an event to a specific channel.
     *
     * @param channel The channel to publish to (e.g., "video.upload")
     * @param message The message payload (usually JSON)
     */
    void publish(String channel, String message);

    /**
     * Broadcasts an object to a WebSocket topic via Redis.
     * 
     * @param topic   The target WebSocket topic (e.g., "/topic/messages/1")
     * @param payload The object to broadcast (will be serialized to JSON)
     */
    void broadcast(String topic, Object payload);

    /**
     * Subscribes to a specific channel.
     * Note: Subscription logic might vary depending on the implementation (Redis
     * Pub/Sub vs Kafka).
     *
     * @param channel  The channel to listen to
     * @param callback A functional interface or listener to handle the message
     */
    void subscribe(String channel, EventListener callback);

    @FunctionalInterface
    interface EventListener {
        void onMessage(String message);
    }
}
