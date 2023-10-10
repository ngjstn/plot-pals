package com.plotpals.client.data;

// roles enum, note that the ordinal values of the roles matter
enum Role {
    CARETAKER,
    PLOT_OWNER,
    GARDEN_OWNER,
    ADMIN,
}

// profile object that maps to a row of the database table 'profiles'
public class Profile {
    private String id;
    private Role role;
    private int rating;
    private String display_name;

    public Profile(String id, Role role, int rating, String display_name) {
        this.id = id;
        this.role = role;
        this.rating = rating;
        this.display_name = display_name;
    }

    public String getId() {
        return id;
    }

    public Role getRole() {
        return role;
    }

    public int getRating() {
        return rating;
    }

    public String getDisplay_name() {
        return display_name;
    }
}
