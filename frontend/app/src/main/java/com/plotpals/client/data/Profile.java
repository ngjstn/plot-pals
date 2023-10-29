package com.plotpals.client.data;

import org.json.JSONException;
import org.json.JSONObject;

// roles enum, note that the ordinal values of the roles matter
enum RoleEnum {
    CARETAKER,
    PLOT_OWNER,
    GARDEN_OWNER,
    ADMIN,
}

/**
 * profile object that maps to a row of the database table 'profiles'
 */
public class Profile {
    private String id;
    private double rating;

    private String displayName;

    private int competence;

    public Profile(String id, double rating, String displayName, int competence) {
        this.id = id;
        this.rating = rating;
        this.displayName = displayName;
        this.competence = competence;
    }

    public Profile(JSONObject profileJsonObject) throws JSONException {
        this(
                profileJsonObject.getString("id"),
                profileJsonObject.getDouble("rating"),
                profileJsonObject.getString("displayName"),
                profileJsonObject.getInt("competence")
                );
    }

    public String getId() {
        return id;
    }

    public double getRating() {
        return rating;
    }

    public String getDisplayName() {
        return displayName;
    }
}
