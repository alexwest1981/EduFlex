package com.eduflex.backend.controller;

import com.eduflex.backend.model.QuestionBankItem;
import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.QuestionBankRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/question-bank")
@CrossOrigin(origins = "*")
public class QuestionBankController {

    private final QuestionBankRepository bankRepo;
    private final UserRepository userRepo;

    public QuestionBankController(QuestionBankRepository bankRepo, UserRepository userRepo) {
        this.bankRepo = bankRepo;
        this.userRepo = userRepo;
    }

    @GetMapping("/my")
    public List<QuestionBankItem> getMyQuestions(@RequestParam Long userId) {
        return bankRepo.findByAuthorId(userId);
    }

    @PostMapping("/add")
    public QuestionBankItem addQuestion(@RequestParam Long userId, @RequestBody QuestionBankItem item) {
        User author = userRepo.findById(userId).orElseThrow();
        item.setAuthor(author);
        return bankRepo.save(item);
    }

    @PostMapping("/import")
    public List<QuestionBankItem> importQuestions(@RequestParam Long userId,
            @RequestBody List<QuestionBankItem> items) {
        User author = userRepo.findById(userId).orElseThrow();
        for (QuestionBankItem item : items) {
            item.setAuthor(author);
        }
        return bankRepo.saveAll(items);
    }

    @DeleteMapping("/{id}")
    public void deleteQuestion(@PathVariable Long id) {
        bankRepo.deleteById(id);
    }

    @GetMapping("/categories")
    public List<String> getCategories(@RequestParam Long userId) {
        return bankRepo.findDistinctCategoriesByAuthorId(userId);
    }

    // Helper to get random questions (to be used by QuizController or Frontend)
    @GetMapping("/random")
    public List<QuestionBankItem> getRandomQuestions(
            @RequestParam Long userId,
            @RequestParam String category,
            @RequestParam(required = false) QuestionBankItem.Difficulty difficulty,
            @RequestParam int count) {

        List<QuestionBankItem> pool = bankRepo.findByAuthorIdAndCategory(userId, category);

        if (difficulty != null) {
            pool = pool.stream()
                    .filter(q -> q.getDifficulty() == difficulty)
                    .collect(Collectors.toList());
        }

        Collections.shuffle(pool);
        return pool.stream().limit(count).collect(Collectors.toList());
    }
}
