package com.eduflex.backend.edugame.model;

import jakarta.persistence.*;

@Entity
@Table(name = "edugame_quest_templates")
public class QuestTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titleTemplate; // e.g., "Complete {count} Quiz(zes)"

    @Column(nullable = false)
    private String descriptionTemplate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Quest.QuestType type;

    @Column(nullable = false)
    private Integer hiddenTargetCountMin; // e.g., 1

    @Column(nullable = false)
    private Integer hiddenTargetCountMax; // e.g., 5

    @Column(nullable = false)
    private Integer baseRewardXp;

    @Column(nullable = false)
    private String actionKey; // e.g., "COMPLETE_QUIZ", "LOGIN"

    @Column(nullable = false)
    private Difficulty difficulty;

    public enum Difficulty {
        EASY, MEDIUM, HARD
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitleTemplate() {
        return titleTemplate;
    }

    public void setTitleTemplate(String titleTemplate) {
        this.titleTemplate = titleTemplate;
    }

    public String getDescriptionTemplate() {
        return descriptionTemplate;
    }

    public void setDescriptionTemplate(String descriptionTemplate) {
        this.descriptionTemplate = descriptionTemplate;
    }

    public Quest.QuestType getType() {
        return type;
    }

    public void setType(Quest.QuestType type) {
        this.type = type;
    }

    public Integer getHiddenTargetCountMin() {
        return hiddenTargetCountMin;
    }

    public void setHiddenTargetCountMin(Integer hiddenTargetCountMin) {
        this.hiddenTargetCountMin = hiddenTargetCountMin;
    }

    public Integer getHiddenTargetCountMax() {
        return hiddenTargetCountMax;
    }

    public void setHiddenTargetCountMax(Integer hiddenTargetCountMax) {
        this.hiddenTargetCountMax = hiddenTargetCountMax;
    }

    public Integer getBaseRewardXp() {
        return baseRewardXp;
    }

    public void setBaseRewardXp(Integer baseRewardXp) {
        this.baseRewardXp = baseRewardXp;
    }

    public String getActionKey() {
        return actionKey;
    }

    public void setActionKey(String actionKey) {
        this.actionKey = actionKey;
    }

    public Difficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Difficulty difficulty) {
        this.difficulty = difficulty;
    }
}
