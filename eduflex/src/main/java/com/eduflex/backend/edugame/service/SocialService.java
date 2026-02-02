package com.eduflex.backend.edugame.service;

import com.eduflex.backend.edugame.model.Friendship;
import com.eduflex.backend.edugame.model.SocialStreak;
import com.eduflex.backend.edugame.repository.FriendshipRepository;
import com.eduflex.backend.edugame.repository.SocialStreakRepository;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SocialService {

    private final FriendshipRepository friendshipRepository;
    private final SocialStreakRepository socialStreakRepository;
    private final UserRepository userRepository;

    public SocialService(FriendshipRepository friendshipRepository,
            SocialStreakRepository socialStreakRepository,
            UserRepository userRepository) {
        this.friendshipRepository = friendshipRepository;
        this.socialStreakRepository = socialStreakRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void sendFriendRequest(Long requesterId, String receiverUsername) {
        User requester = userRepository.findById(requesterId).orElseThrow();
        User receiver = userRepository.findByUsername(receiverUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (requester.getId().equals(receiver.getId())) {
            throw new RuntimeException("You cannot be friend with yourself");
        }

        if (friendshipRepository.findExistingFriendship(requesterId, receiver.getId()).isPresent()) {
            throw new RuntimeException("Friendship or request already exists");
        }

        Friendship friendship = new Friendship();
        friendship.setRequester(requester);
        friendship.setReceiver(receiver);
        friendship.setStatus(Friendship.FriendshipStatus.PENDING);
        friendshipRepository.save(friendship);
    }

    @Transactional
    public void acceptFriendRequest(Long receiverId, Long friendshipId) {
        Friendship friendship = friendshipRepository.findById(friendshipId).orElseThrow();

        if (!friendship.getReceiver().getId().equals(receiverId)) {
            throw new RuntimeException("Not authorized to accept this request");
        }

        friendship.setStatus(Friendship.FriendshipStatus.ACCEPTED);
        friendshipRepository.save(friendship);

        // Initialize Social Streak
        SocialStreak streak = new SocialStreak();
        streak.setUser1(friendship.getRequester());
        streak.setUser2(friendship.getReceiver());
        socialStreakRepository.save(streak);
    }

    public List<Friendship> getMyFriends(Long userId) {
        return friendshipRepository.findAllAcceptedFriendships(userId);
    }

    public List<Friendship> getPendingRequests(Long userId) {
        return friendshipRepository.findPendingRequests(userId);
    }
}
