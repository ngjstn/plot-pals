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
    private String assignerId;

    private boolean isCompleted;

    private boolean assigneeIsProvidedFeedback;

    private String deadlineDate;

    private String taskStartTime;

    private String taskEndTime;

    private int expectedTaskDurationInHours;

    /* Entries that are not in the tasks table but still would be useful */
    private String assigneeName;

    public Task(int id,
                int plotId,
                String reward,
                double minimumRating,
                String assigneeId,
                boolean isCompleted,
                boolean assigneeIsProvidedFeedback,
                String deadlineDate,
                String taskStartTime,
                String taskEndTime,
                int expectedTaskDurationInHours,
                String assigneeName){
        this.id = id;
        this.plotId = plotId;
        this.reward = reward;
        this.minimumRating = minimumRating;
        this.assigneeId = assigneeId;
        this.isCompleted = isCompleted;
        this.assigneeIsProvidedFeedback = assigneeIsProvidedFeedback;
        this.deadlineDate = deadlineDate;
        this.taskStartTime = taskStartTime;
        this.taskEndTime = taskEndTime;
        this.expectedTaskDurationInHours = expectedTaskDurationInHours;
        this.assigneeName = assigneeName;
    }

    /*
     * To be used within GET api calls for tasks
     */
    public Task(JSONObject taskJsonObject) throws JSONException {
        this(taskJsonObject.getInt("taskId"),
                taskJsonObject.optInt("plotId", -1),
                taskJsonObject.getString("reward"),
                taskJsonObject.getDouble("minimumRating"),
                taskJsonObject.optString("assigneeId", null),
                taskJsonObject.getInt("isCompleted") == 1,
                taskJsonObject.getInt("assigneeIsProvidedFeedback") == 1,
                taskJsonObject.getString("deadlineDate"),
                taskJsonObject.optString("taskStartTime", null),
                taskJsonObject.optString("taskEndTime", null),
                taskJsonObject.getInt("expectedTaskDurationInHours"),
                taskJsonObject.optString("assigneeName", null)
        );
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
