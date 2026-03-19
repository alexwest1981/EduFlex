package com.eduflex.accessibility;

import lombok.Data;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class RequirementResponse {
    private List<AccessibilityRequirement> data;
}
