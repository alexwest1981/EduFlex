package com.eduflex.backend.repository;

import com.eduflex.backend.model.GamificationLeagueSetting;
import com.eduflex.backend.model.League;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GamificationLeagueSettingRepository extends JpaRepository<GamificationLeagueSetting, Long> {
    Optional<GamificationLeagueSetting> findByLeagueKey(League leagueKey);
}
