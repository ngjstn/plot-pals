package com.plotpals.client.data;

/**
 * Make note that the ordinal values of the roles matter
 */
public enum RoleEnum {
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
