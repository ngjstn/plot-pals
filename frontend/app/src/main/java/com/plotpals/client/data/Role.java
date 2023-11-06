package com.plotpals.client.data;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Role object that maps to a row of the database table 'roles'
 */
public class Role {
    private String profileId;

    private int gardenId;

    private RoleEnum roleNum;

    /* The following are not part of gardens table but can be added to role object if needed */

    private String gardenName;

    private String gardenMemberName;

    public Role(JSONObject rolesJsonObject) throws JSONException {
        this.profileId = rolesJsonObject.getString("profileId");
        this.gardenId = rolesJsonObject.getInt("gardenId");
        this.roleNum = RoleEnum.values()[rolesJsonObject.getInt("roleNum")];
        this.gardenName = rolesJsonObject.optString("gardenName", null);
        this.gardenMemberName = rolesJsonObject.optString("gardenMemberName", null);
    }


    public String getProfileId() {
        return profileId;
    }

    public int getGardenId() {
        return gardenId;
    }

    public RoleEnum getRoleNum() {
        return roleNum;
    }

    public String getGardenName() {
        return gardenName;
    }

    public String getGardenMemberName() {
        return gardenMemberName;
    }
}
