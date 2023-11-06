package com.plotpals.client.data;

import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Task object that maps to entries of 'tasks' table
 */
public class Task {
    private int id;

    private int plotId;

    private String reward;

    private double minimumRating;

    private String assigneeId;

    private boolean isCompleted;

    private boolean assigneeIsProvidedFeedback;

    private String deadlineDate;

    private String taskStartTime;

    private String taskEndTime;

    private int expectedTaskDurationInHours;

    /* Entries that are not in the tasks table but still would be useful */
    private String assigneeName;

    /*
     * To be used within GET api calls for tasks
     */
    public Task(JSONObject taskJsonObject) throws JSONException {
        this.id = taskJsonObject.getInt("taskId");
        this.plotId = taskJsonObject.optInt("plotId", -1);
        this.reward = taskJsonObject.getString("reward");
        this.minimumRating = taskJsonObject.getDouble("minimumRating");
        this.assigneeId = taskJsonObject.optString("assigneeId", null);
        this.isCompleted = taskJsonObject.getInt("isCompleted") == 1;
        this.assigneeIsProvidedFeedback = taskJsonObject.getInt("assigneeIsProvidedFeedback") == 1;
        this.deadlineDate = taskJsonObject.getString("deadlineDate");
        this.taskStartTime = taskJsonObject.optString("taskStartTime", null);
        this.taskEndTime = taskJsonObject.optString("taskEndTime", null);
        this.expectedTaskDurationInHours = taskJsonObject.getInt("expectedTaskDurationInHours");
        this.assigneeName = taskJsonObject.optString("assigneeName", null);
    }


    public int getId() {
        return id;
    }

    public int getPlotId() {
        return plotId;
    }


    public String getReward() {
        return reward;
    }

    public double getMinimumRating() {
        return minimumRating;
    }

    public String getAssigneeId() {
        return assigneeId;
    }

    public boolean isCompleted() {
        return isCompleted;
    }

    public boolean isAssigneeIsProvidedFeedback() {
        return assigneeIsProvidedFeedback;
    }

    public String getDeadlineDate() {
        return deadlineDate;
    }

    public String getTaskStartTime() {
        return taskStartTime;
    }

    public String getTaskEndTime() {
        return taskEndTime;
    }

    public int getExpectedTaskDurationInHours() {
        return expectedTaskDurationInHours;
    }

    public String getAssigneeName() {
        Log.d("Task", "RETURNING ASSIGNEE NAME: " + assigneeName);
        return assigneeName;
    }


}
