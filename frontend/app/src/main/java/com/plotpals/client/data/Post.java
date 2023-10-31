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

    public Post(int id, String title, String description, String assignerId, int postGardenId, Task task) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.assignerId = assignerId;
        this.postGardenId = postGardenId;
        this.task = task;
    }

    public Post(JSONObject postJsonObject) throws JSONException {
        this(postJsonObject.getInt("id"),
                postJsonObject.getString("title"),
                postJsonObject.getString("description"),
                postJsonObject.getString("assignerId"),
                postJsonObject.getInt("postGardenId"),
                null
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
    }

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
}
