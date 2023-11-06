package com.plotpals.client.data;

import org.json.JSONException;
import org.json.JSONObject;

public class Plot {
    private int id;

    private int gardenId;

    private String plotOwnerId;

    /* The following fields are not part of the plots table */
    private String plotOwnerName;

    private String gardenName;

    public Plot(JSONObject plotsJsonObject) throws JSONException {
        this.id = plotsJsonObject.getInt("id");
        this.gardenId = plotsJsonObject.getInt("gardenId");
        this.plotOwnerId = plotsJsonObject.getString("plotOwnerId");
        this.plotOwnerName = plotsJsonObject.getString("plotOwnerName");
        this.gardenName = plotsJsonObject.getString("gardenName");
    }

    public int getId() {
        return id;
    }

    public int getGardenId() {
        return gardenId;
    }

    public String getPlotOwnerId() {
        return plotOwnerId;
    }

    public String getPlotOwnerName() {
        return plotOwnerName;
    }

    public String getGardenName() {
        return gardenName;
    }
}
