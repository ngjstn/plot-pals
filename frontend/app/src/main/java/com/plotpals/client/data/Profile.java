package com.plotpals.client.data;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Profile object that maps to a row of the database table 'profiles'
 */
public class Profile {
    private String id;
    private double rating;

    private String displayName;

    private int competence;

    public Profile(JSONObject profileJsonObject) throws JSONException {
        this.id = profileJsonObject.getString("id");
        this.rating = profileJsonObject.getDouble("rating");
        this.displayName = profileJsonObject.getString("displayName");
        this.competence = profileJsonObject.getInt("competence");
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

    public int getCompetence() {
        return competence;
    }
}
