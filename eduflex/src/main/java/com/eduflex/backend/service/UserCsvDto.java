package com.eduflex.backend.service;

import com.opencsv.bean.CsvBindByName;

public class UserCsvDto {

    @CsvBindByName(column = "username", required = true)
    private String username;

    @CsvBindByName(column = "email", required = true)
    private String email;

    @CsvBindByName(column = "firstname", required = true)
    private String firstName;

    @CsvBindByName(column = "lastname", required = true)
    private String lastName;

    @CsvBindByName(column = "password")
    private String password;

    @CsvBindByName(column = "role")
    private String role;

    // Getters and Setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
