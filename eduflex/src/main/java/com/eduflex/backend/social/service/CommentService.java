package com.eduflex.backend.social.service;

import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import com.eduflex.backend.social.model.Comment;
import com.eduflex.backend.social.model.TargetType;
import com.eduflex.backend.social.repository.CommentRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    public CommentService(CommentRepository commentRepository, UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<Comment> getComments(TargetType targetType, String targetId) {
        return commentRepository.findByTargetTypeAndTargetIdAndParentIsNullOrderByCreatedAtDesc(targetType, targetId);
    }

    @Transactional
    public Comment addComment(String content, TargetType targetType, String targetId, Long parentId) {
        User author = getCurrentUser();

        Comment comment = new Comment();
        comment.setContent(content);
        comment.setAuthor(author);
        comment.setTargetType(targetType);
        comment.setTargetId(targetId);

        if (parentId != null) {
            Comment parent = commentRepository.findById(parentId)
                    .orElseThrow(() -> new EntityNotFoundException("Parent comment not found"));
            comment.setParent(parent);
            // Verify target matches parent
            if (!parent.getTargetId().equals(targetId) || parent.getTargetType() != targetType) {
                throw new IllegalArgumentException("Reply target must match parent target");
            }
        }

        return commentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(Long commentId) {
        User currentUser = getCurrentUser();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found"));

        // Only allow author or admin to delete
        boolean isAdmin = false;
        if (currentUser.getRole() != null) {
            isAdmin = "ROLE_ADMIN".equals(currentUser.getRole().getName());
        }

        if (!comment.getAuthor().getId().equals(currentUser.getId()) && !isAdmin) {
            throw new SecurityException("You are not authorized to delete this comment");
        }

        commentRepository.delete(comment);
    }

    @Transactional
    public Comment toggleLike(Long commentId) {
        User currentUser = getCurrentUser();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found"));

        if (comment.getLikes().contains(currentUser)) {
            comment.getLikes().remove(currentUser);
        } else {
            comment.getLikes().add(currentUser);
        }
        return commentRepository.save(comment);
    }

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }
}
