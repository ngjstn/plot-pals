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

    private Post(int id, String title, String description, String assignerId, int postGardenId, Task task, String gardenName, String assignerName) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.assignerId = assignerId;
        this.postGardenId = postGardenId;
        this.task = task;
        this.gardenName = gardenName;
        this.assignerName = assignerName;
    }

    public Post(JSONObject postJsonObject) throws JSONException {
        this(postJsonObject.getInt("id"),
                postJsonObject.getString("title"),
                postJsonObject.getString("description"),
                postJsonObject.getString("assignerId"),
                postJsonObject.getInt("postGardenId"),
                null,
                postJsonObject.optString("gardenName", null),
                postJsonObject.optString("assignerName", null)
        );

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
