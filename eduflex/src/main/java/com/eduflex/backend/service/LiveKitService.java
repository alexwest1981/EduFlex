package com.eduflex.backend.service;

import io.livekit.server.AccessToken;
import io.livekit.server.RoomJoin;
import io.livekit.server.RoomName;
import io.livekit.server.RoomAdmin;
import io.livekit.server.RoomCreate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Service
public class LiveKitService {
    private static final Logger logger = LoggerFactory.getLogger(LiveKitService.class);

    @Value("${livekit.api.key:devkey}")
    private String apiKey;

    @Value("${livekit.api.secret:secret}")
    private String apiSecret;

    /**
     * Generate a join token for a LiveKit room.
     *
     * @param roomName The name of the room to join.
     * @param identity The unique identity of the participant (e.g., username or
     *                 ID).
     * @param name     The display name of the participant.
     * @param isHost   Whether the participant should have host (admin) permissions.
     * @return The generated access token.
     */
    public String createJoinToken(String roomName, String identity, String name, boolean isHost) {
        AccessToken token = new AccessToken(apiKey, apiSecret);
        token.setIdentity(identity);
        token.setName(name);

        token.addGrants(List.of(
                new RoomJoin(true),
                new RoomName(roomName)));

        if (isHost) {
            token.addGrants(List.of(
                    new RoomCreate(true),
                    new RoomAdmin(true)));
        }

        logger.info("Generated LiveKit token for room: {}, identity: {}, host: {}", roomName, identity, isHost);
        return token.toJwt();
    }
}
