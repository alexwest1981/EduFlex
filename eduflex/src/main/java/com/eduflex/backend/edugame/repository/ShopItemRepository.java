package com.eduflex.backend.edugame.repository;

import com.eduflex.backend.edugame.model.ShopItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShopItemRepository extends JpaRepository<ShopItem, Long> {
    List<ShopItem> findByType(ShopItem.ItemType type);
}
