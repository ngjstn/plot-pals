package com.plotpals.client.data;

import org.json.JSONException;
import org.json.JSONObject;

// roles enum, note that the ordinal values of the roles matter
enum RoleEnum {
    CARETAKER {
        public String toString() {
            return "Caretaker";
        }
    },
    PLOT_OWNER {
        public String toString() {
            return "Plot Owner";
        }
    },
    GARDEN_OWNER {
        public String toString() {
            return "Garden Owner";
        }
    },
    ADMIN {
        public String toString() {
            return "Admin";
        }
    },
}

public class Role {
    private String profileId;

    private int gardenId;

    private RoleEnum roleNum;

    private String gardenName;

    public Role(String profileId, int gardenId, RoleEnum roleNum, String gardenName) {
        this.profileId = profileId;
        this.gardenId = gardenId;
        this.roleNum = roleNum;
        this.gardenName = gardenName;
    }

    public Role(JSONObject rolesJsonObject) throws JSONException {
        this(
                rolesJsonObject.getString("profileId"),
                rolesJsonObject.getInt("gardenId"),
                RoleEnum.values()[rolesJsonObject.getInt("roleNum")],
                rolesJsonObject.optString("gardenName", null)
        );
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

}
