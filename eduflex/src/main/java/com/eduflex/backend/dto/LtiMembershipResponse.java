package com.eduflex.backend.dto;

import lombok.Data;
import java.util.List;

public class LtiMembershipResponse {
    private String id;
    private LtiContext context;
    private List<LtiMember> members;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public LtiContext getContext() {
        return context;
    }

    public void setContext(LtiContext context) {
        this.context = context;
    }

    public List<LtiMember> getMembers() {
        return members;
    }

    public void setMembers(List<LtiMember> members) {
        this.members = members;
    }

    public static class LtiContext {
        private String id;
        private String label;
        private String title;

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getLabel() {
            return label;
        }

        public void setLabel(String label) {
            this.label = label;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }
    }

    public static class LtiMember {
        private String status;
        private String name;
        private String picture;
        private String given_name;
        private String family_name;
        private String email;
        private String user_id;
        private List<String> roles;

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getPicture() {
            return picture;
        }

        public void setPicture(String picture) {
            this.picture = picture;
        }

        public String getGiven_name() {
            return given_name;
        }

        public void setGiven_name(String given_name) {
            this.given_name = given_name;
        }

        public String getFamily_name() {
            return family_name;
        }

        public void setFamily_name(String family_name) {
            this.family_name = family_name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getUser_id() {
            return user_id;
        }

        public void setUser_id(String user_id) {
            this.user_id = user_id;
        }

        public List<String> getRoles() {
            return roles;
        }

        public void setRoles(List<String> roles) {
            this.roles = roles;
        }
    }
}
