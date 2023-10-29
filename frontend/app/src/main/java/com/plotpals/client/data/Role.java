package com.plotpals.client.data;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Make note that the ordinal values of the roles matter
 */
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

    public Role(String profileId, int gardenId, RoleEnum roleNum, String gardenName, String gardenMemberName) {
        this.profileId = profileId;
        this.gardenId = gardenId;
        this.roleNum = roleNum;
        this.gardenName = gardenName;
        this.gardenMemberName = gardenMemberName;
    }

    public Role(JSONObject rolesJsonObject) throws JSONException {
        this(
                rolesJsonObject.getString("profileId"),
                rolesJsonObject.getInt("gardenId"),
                RoleEnum.values()[rolesJsonObject.getInt("roleNum")],
                rolesJsonObject.optString("gardenName", null),
                rolesJsonObject.optString("gardenMemberName", null)
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

    public String getGardenMemberName() {
        return gardenMemberName;
    }
}
