package com.plotpals.client;

import static androidx.test.espresso.intent.Intents.intended;
import static androidx.test.espresso.intent.matcher.IntentMatchers.hasComponent;

import androidx.test.espresso.Espresso;
import androidx.test.espresso.action.ViewActions;
import androidx.test.espresso.intent.Intents;
import androidx.test.espresso.matcher.ViewMatchers;
import androidx.test.ext.junit.rules.ActivityScenarioRule;
import androidx.test.ext.junit.runners.AndroidJUnit4;

import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
public class TestAddTask {

    @Rule
    public ActivityScenarioRule<AppEntryActivity> activityScenarioRule = new ActivityScenarioRule<>(AppEntryActivity.class);

    @Before
    public void setUp() {
        Intents.init();
    }

    @Test
    public void testAddTask() {
        try {

            // Note that your emulator may need to have a Google account ready.
            // This test does not check for an account itself for now.

            // Auto sign in
            Thread.sleep(2000);

            // Press navbar garden button
            Espresso.onView(ViewMatchers.withId(R.id.button_navbar_garden)).perform(ViewActions.click());

            // Wait for activity to load
            Thread.sleep(2000);

            // Check activity is correct
            intended(hasComponent(MyGardenYesGardenActivity.class.getName()));

            // Extra time to manually check on emulator screen
            // Thread.sleep(2000);

        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }

    @After
    public void tearDown() {
        Intents.release();
    }

}