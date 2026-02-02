package com.eduflex.backend.edugame.repository;

import com.eduflex.backend.edugame.model.Friendship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

    @Query("SELECT f FROM Friendship f WHERE (f.requester.id = :userId OR f.receiver.id = :userId) AND f.status = 'ACCEPTED'")
    List<Friendship> findAllAcceptedFriendships(@Param("userId") Long userId);

    @Query("SELECT f FROM Friendship f WHERE f.receiver.id = :userId AND f.status = 'PENDING'")
    List<Friendship> findPendingRequests(@Param("userId") Long userId);

    @Query("SELECT f FROM Friendship f WHERE (f.requester.id = :u1 AND f.receiver.id = :u2) OR (f.requester.id = :u2 AND f.receiver.id = :u1)")
    Optional<Friendship> findExistingFriendship(@Param("u1") Long u1, @Param("u2") Long u2);
}
