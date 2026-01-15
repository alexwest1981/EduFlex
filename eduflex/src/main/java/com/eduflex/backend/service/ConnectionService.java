package com.eduflex.backend.service;

import com.eduflex.backend.model.Connection;
import com.eduflex.backend.model.ConnectionStatus;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.ConnectionRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ConnectionService {

    @Autowired
    private ConnectionRepository connectionRepository;

    @Autowired
    private UserRepository userRepository;

    public Connection sendRequest(Long requesterId, Long receiverId) {
        if (requesterId.equals(receiverId)) {
            throw new IllegalArgumentException("Cannot send connection request to yourself.");
        }

        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("Requester not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        // Check if connection already exists
        Optional<Connection> existing = connectionRepository.findByRequesterAndReceiver(requester, receiver);
        if (existing.isPresent()) {
            throw new RuntimeException("Connection request already exists or you are already connected.");
        }

        // Also check reverse direction if they might have sent one
        Optional<Connection> reverse = connectionRepository.findByRequesterAndReceiver(receiver, requester);
        if (reverse.isPresent()) {
            if (reverse.get().getStatus() == ConnectionStatus.BLOCKED) {
                // Silently fail or throw specific error? Better to just say "Cannot connect"
                throw new RuntimeException("Cannot send request.");
            }
            throw new RuntimeException(
                    "Connection request already exists from the other user. Please accept that one instead.");
        }

        Connection connection = new Connection();
        connection.setRequester(requester);
        connection.setReceiver(receiver);
        connection.setStatus(ConnectionStatus.PENDING);
        return connectionRepository.save(connection);
    }

    public Connection acceptRequest(Long connectionId, Long userId) {
        Connection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new RuntimeException("Connection not found"));

        if (!connection.getReceiver().getId().equals(userId)) {
            throw new RuntimeException("You are not authorized to accept this request.");
        }

        if (connection.getStatus() != ConnectionStatus.PENDING) {
            throw new RuntimeException("Connection request is not pending.");
        }

        connection.setStatus(ConnectionStatus.ACCEPTED);
        return connectionRepository.save(connection);
    }

    public void rejectRequest(Long connectionId, Long userId) {
        Connection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new RuntimeException("Connection not found"));

        if (!connection.getReceiver().getId().equals(userId)) {
            throw new RuntimeException("You are not authorized to reject this request.");
        }

        connection.setStatus(ConnectionStatus.REJECTED);
        connectionRepository.save(connection);
    }

    public List<Connection> getIncomingRequests(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return connectionRepository.findByReceiverAndStatus(user, ConnectionStatus.PENDING);
    }

    public ConnectionStatus getConnectionStatus(Long user1Id, Long user2Id) {
        if (user1Id == null || user2Id == null)
            return null;
        Optional<User> u1Opt = userRepository.findById(user1Id);
        Optional<User> u2Opt = userRepository.findById(user2Id);

        if (u1Opt.isEmpty() || u2Opt.isEmpty())
            return null; // Treat as no connection if user missing

        User u1 = u1Opt.get();
        User u2 = u2Opt.get();

        Optional<Connection> c1 = connectionRepository.findByRequesterAndReceiver(u1, u2);
        if (c1.isPresent())
            return c1.get().getStatus();

        Optional<Connection> c2 = connectionRepository.findByRequesterAndReceiver(u2, u1);
        if (c2.isPresent())
            return c2.get().getStatus();

        return null; // No connection
    }

    public void removeConnection(Long userId, Long targetUserId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("Target user not found"));

        Optional<Connection> c1 = connectionRepository.findByRequesterAndReceiver(user, target);
        c1.ifPresent(connectionRepository::delete);

        Optional<Connection> c2 = connectionRepository.findByRequesterAndReceiver(target, user);
        c2.ifPresent(connectionRepository::delete);
    }

    public void blockUser(Long userId, Long targetUserId) {
        // Remove existing connection first if any
        removeConnection(userId, targetUserId);

        // Create a new BLOCKED connection
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("Target user not found"));

        Connection connection = new Connection();
        connection.setRequester(user); // "Requester" is the one who blocked
        connection.setReceiver(target);
        connection.setStatus(ConnectionStatus.BLOCKED);
        connectionRepository.save(connection);
    }

    public void unblockUser(Long userId, Long targetUserId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("Target user not found"));

        // Only remove if I am the one who blocked (requester)
        Optional<Connection> c1 = connectionRepository.findByRequesterAndReceiver(user, target);
        if (c1.isPresent() && c1.get().getStatus() == ConnectionStatus.BLOCKED) {
            connectionRepository.delete(c1.get());
        }
    }
}
