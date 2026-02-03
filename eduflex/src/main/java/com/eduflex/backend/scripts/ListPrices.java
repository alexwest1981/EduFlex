package com.eduflex.backend.scripts;

import com.stripe.Stripe;
import com.stripe.model.Price;
import com.stripe.model.PriceCollection;
import com.stripe.param.PriceListParams;

public class ListPrices {
    public static void main(String[] args) {
        String apiKey = System.getenv("STRIPE_SECRET_KEY");
        if (apiKey == null || apiKey.isBlank()) {
            System.err.println("STRIPE_SECRET_KEY environment variable is missing!");
            System.exit(1);
        }

        Stripe.apiKey = apiKey;

        try {
            PriceListParams params = PriceListParams.builder()
                    .setLimit(20L)
                    .setActive(true)
                    .build();

            PriceCollection prices = Price.list(params);

            System.out.println("--- Available Stripe Prices ---");
            for (Price price : prices.getData()) {
                System.out.printf("ID: %s | Nickname: %s | Amount: %d %s | Recurring: %s%n",
                        price.getId(),
                        price.getNickname(),
                        price.getUnitAmount(),
                        price.getCurrency(),
                        price.getRecurring() != null ? price.getRecurring().getInterval() : "one-time");
            }
            System.out.println("-------------------------------");
        } catch (Exception e) {
            System.err.println("Error listing prices: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
