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

    public Plot(int id, int gardenId, String plotOwnerId, String plotOwnerName, String gardenName) {
        this.id = id;
        this.gardenId = gardenId;
        this.plotOwnerId = plotOwnerId;
        this.plotOwnerName = plotOwnerName;
        this.gardenName = gardenName;
    }

    public Plot(JSONObject plotsJsonObject) throws JSONException {
        this(plotsJsonObject.getInt("id"),
                plotsJsonObject.getInt("gardenId"),
                plotsJsonObject.getString("plotOwnerId"),
                plotsJsonObject.getString("plotOwnerName"),
                plotsJsonObject.getString("gardenName"));
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
