package com.plotpals.client.data;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Date;

/**
 * task object that maps to entries of 'tasks' table
 */
public class Task {
    private int id;

    private int plotId;

    private int gardenId;

    private String reward;

    private double minimumRating;

    private String title;

    private String description;

    private String assignerId;

    private String assigneeId;

    private boolean isCompleted;

    private boolean assigneeIsProvidedFeedback;

    private String deadlineDate;

    private String taskStartTime;

    private String taskEndTime;

    private int expectedTaskDurationInHours;

    /* The following are not part of tasks table but can be added to task object if needed */

    private String gardenName;

    public Task(int id,
                int plotId,
                int gardenId,
                String reward,
                double minimumRating,
                String title,
                String description,
                String assignerId,
                String assigneeId,
                boolean isCompleted,
                boolean assigneeIsProvidedFeedback,
                String deadlineDate,
                String taskStartTime,
                String taskEndTime,
                int expectedTaskDurationInHours,
                String gardenName ) {
        this.id = id;
        this.plotId = plotId;
        this.gardenId = gardenId;
        this.reward = reward;
        this.minimumRating = minimumRating;
        this.title = title;
        this.description = description;
        this.assignerId = assignerId;
        this.assigneeId = assigneeId;
        this.isCompleted = isCompleted;
        this.assigneeIsProvidedFeedback = assigneeIsProvidedFeedback;
        this.deadlineDate = deadlineDate;
        this.taskStartTime = taskStartTime;
        this.taskEndTime = taskEndTime;
        this.expectedTaskDurationInHours = expectedTaskDurationInHours;
        this.gardenName = gardenName;
    }

    /*
     * To be used within GET api calls for tasks
     */
    public Task(JSONObject taskJsonObject) throws JSONException {
        this(taskJsonObject.getInt("id"),
                taskJsonObject.optInt("plotId", -1),
                taskJsonObject.getInt("gardenId"),
                taskJsonObject.getString("reward"),
                taskJsonObject.getDouble("minimumRating"),
                taskJsonObject.getString("title"),
                taskJsonObject.getString("description"),
                taskJsonObject.getString("assignerId"),
                taskJsonObject.optString("assigneeId", null),
                taskJsonObject.getInt("isCompleted") == 1,
                taskJsonObject.getInt("assigneeIsProvidedFeedback") == 1,
                taskJsonObject.getString("deadlineDate"),
                taskJsonObject.optString("taskStartTime", null),
                taskJsonObject.optString("taskEndTime", null),
                taskJsonObject.getInt("expectedTaskDurationInHours"),
                taskJsonObject.optString("gardenName", null)
        );
    }


    public int getId() {
        return id;
    }

    public int getPlotId() {
        return plotId;
    }

    public int getGardenId() {
        return gardenId;
    }

    public String getReward() {
        return reward;
    }

    public double getMinimumRating() {
        return minimumRating;
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

    public String getGardenName() {
        return gardenName;
    }

    @Override
    public String toString() {
        if(gardenName == null) {
            return this.title;
        }
        return this.gardenName + " - " + this.title;
    }
}
