package com.plotpals.client.data;

/**
 * update object that maps to a row of the database table 'updates'
 */
public class Update {
    private int id;

    private String userId;

    private String description;

    private String title;

    public Update(int id, String userId, String description, String title) {
        this.id = id;
        this.userId = userId;
        this.description = description;
        this.title = title;
    }

    public int getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public String getDescription() {
        return description;
    }

    public String getTitle() {
        return title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public String toString() {
        return this.title;
    }
}
