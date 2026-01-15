package com.eduflex.backend.repository;

import com.eduflex.backend.model.Connection;
import com.eduflex.backend.model.ConnectionStatus;
import com.eduflex.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConnectionRepository extends JpaRepository<Connection, Long> {

    // Find specific connection between two users (order independent check might be
    // needed in service, but here specific)
    Optional<Connection> findByRequesterAndReceiver(User requester, User receiver);

    // Find all connections where user is involved
    @Query("SELECT c FROM Connection c WHERE c.requester = :user OR c.receiver = :user")
    List<Connection> findAllByUser(@Param("user") User user);

    // Find accepted connections (friends)
    @Query("SELECT c FROM Connection c WHERE (c.requester = :user OR c.receiver = :user) AND c.status = 'ACCEPTED'")
    List<Connection> findAcceptedConnections(@Param("user") User user);

    // Find pending requests received by user
    List<Connection> findByReceiverAndStatus(User receiver, ConnectionStatus status);
}
