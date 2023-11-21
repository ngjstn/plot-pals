package com.plotpals.client;

import static androidx.test.espresso.intent.Intents.intended;
import static androidx.test.espresso.intent.matcher.IntentMatchers.hasComponent;

import android.content.Intent;

import androidx.test.core.app.ApplicationProvider;
import androidx.test.espresso.Espresso;
import androidx.test.espresso.action.ViewActions;
import androidx.test.espresso.intent.Intents;
import androidx.test.espresso.matcher.ViewMatchers;
import androidx.test.ext.junit.rules.ActivityScenarioRule;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import androidx.test.uiautomator.UiDevice;
import androidx.test.uiautomator.UiObject;
import androidx.test.uiautomator.UiObjectNotFoundException;
import androidx.test.uiautomator.UiSelector;

import junit.framework.AssertionFailedError;

import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
public class TestAddTask {

    static Intent intent;
    static {
        intent = new Intent(ApplicationProvider.getApplicationContext(), HomepageActivity.class);
        intent.putExtra("accountGoogleName", "alan");
        intent.putExtra("accountGoogleProfilePictureImageUrl", "https://avatars.githubusercontent.com/u/57464218?s=400&u=e37a25b70523e5da18b6653c8ccbf3373d7aa289&v=4");
        intent.putExtra("accountUserId", "123456");
        //intent.putExtra("accountIdToken", "abcdef");
        //intent.putExtra("accountUserId", "102251803449216000773");
        intent.putExtra("accountIdToken", "eyJhbGciOiJSUzI1NiIsImtpZCI6IjViMzcwNjk2MGUzZTYwMDI0YTI2NTVlNzhjZmE2M2Y4N2M5N2QzMDkiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIxODgyMjE2MjkyNTktZmdsa2hoOGV1Z2d0aGxzNDRmZ2JrbzUybnBzbmxsNmwuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIxODgyMjE2MjkyNTktNjc1b2x0MWxzY2plZmprbGxqMTRjdW84MDFyNWVvcXYuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDIyNTE4MDM0NDkyMTYwMDA3NzMiLCJlbWFpbCI6ImFsYW5zaGVuMTExQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiYWxhbiIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NJSnBmRWJiUks3eVQyeVI4Z2poYjRCOWZtc1poV1FEZUQwNFRKN0tHQlNYeUU9czk2LWMiLCJnaXZlbl9uYW1lIjoiYWxhbiIsImxvY2FsZSI6ImVuIiwiaWF0IjoxNzAwNTIzOTM3LCJleHAiOjE3MDA1Mjc1Mzd9.ttvyaGXirTYojtpqNSl2gAX2PQP6Aj5tyu8NMQtxp0wZvNcR3Azf9IDnwKxxlMiE41Zp4roC64QRJkJiraRe5urt-kgthET5cGB_XqYeCQtgfC02Y-E4cOolSTMEG3lToz6KKI8_skHaSgswCmZ0XAajHborfp7KxyXdfJW4qB5vJCqDU5Uuvj5alLH0VvE5wS2qNK5_BXPW-Ah65KWmGdE9xwCMGsUslLKBP-fTBx30VMX3ac7F3aW5rwRLX1XYYa27r3cNQu5xZhxGuMXUJDm6vY0IWRFz0wuC2HbEsTVdZHy3Df95l7JppsaOtaMzS8C61B_ZPmGIAFDE2-_dFw");
    }

    @Rule
    public ActivityScenarioRule<HomepageActivity> activityScenarioRule = new ActivityScenarioRule<>(intent);

    @Before
    public void setUp() {
        Intents.init();
    }

    @Test
    public void testAddTask() {
        try {
            // Press navbar garden button
            Espresso.onView(ViewMatchers.withId(R.id.button_navbar_garden)).perform(ViewActions.click());
            Thread.sleep(99999);
            intended(hasComponent(MyGardenYesGardenActivity.class.getName()));

            // Extra time to manually check on emulator screen
            //Thread.sleep(999999);

        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }

    @After
    public void tearDown() {
        Intents.release();
    }

}