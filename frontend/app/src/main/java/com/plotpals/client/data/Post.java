package com.plotpals.client.data;

import org.json.JSONException;
import org.json.JSONObject;

public class Post {
    private int id;

    private String title;

    private String description;

    private String assignerId;

    private int postGardenId;

    private Task task;

    /* Entries that are not in the posts table but still would be useful */
    private String gardenName;

    private String assignerName;

    public Post(JSONObject postJsonObject) throws JSONException {
        this.id = postJsonObject.getInt("id");
        this.title = postJsonObject.getString("title");
        this.description = postJsonObject.getString("description");
        this.assignerId = postJsonObject.getString("assignerId");
        this.postGardenId = postJsonObject.getInt("postGardenId");
        this.task = null;
        this.gardenName = postJsonObject.optString("gardenName", null);
        this.assignerName = postJsonObject.optString("assignerName", null);

        /**
         * If post is a task
         */
        if (postJsonObject.optInt("taskId", -1) != -1) {
            this.task = new Task(postJsonObject);
        }
    }

    public int getId() {
        return id;
    } // BE CAREFUL USING THIS, TALK TO JAMES/ALAN/ADRI FIRST

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getAssignerId() {
        return assignerId;
    }

    public int getPostGardenId() {
        return postGardenId;
    }

    public Task getTask() {
        return task;
    }

    public String getGardenName() {
        return gardenName;
    }

    public String getAssignerName() {
        return assignerName;
    }
}
