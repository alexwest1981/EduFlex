package com.eduflex.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "gamification_league_settings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GamificationLeagueSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "league_key", nullable = false, unique = true)
    @Enumerated(EnumType.STRING)
    private League leagueKey;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(name = "min_points", nullable = false)
    private int minPoints;

    @Column(name = "icon")
    private String icon;

    @Column(name = "reward_description")
    private String rewardDescription;

    @Column(name = "color_hex")
    private String colorHex;
}
