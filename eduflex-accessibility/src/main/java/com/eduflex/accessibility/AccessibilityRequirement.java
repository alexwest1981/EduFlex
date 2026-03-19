package com.eduflex.accessibility;

import lombok.Data;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AccessibilityRequirement {
    private String id;
    private String name;
    private String regulatoryFramework;
    private String wcag;
    private String en301549;
    private String contentType;
    private String category;
    private String objectType;
    private String statement;
    private List<String> textSuggestions;
}
