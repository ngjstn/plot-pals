package com.plotpals.client;


import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.Espresso.pressBack;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;
import static androidx.test.espresso.matcher.ViewMatchers.withId;

import android.content.Intent;

import androidx.test.core.app.ApplicationProvider;
import androidx.test.espresso.intent.Intents;
import androidx.test.ext.junit.rules.ActivityScenarioRule;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.filters.LargeTest;

import com.plotpals.client.utils.TaskSocketHandler;

import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

@LargeTest
@RunWith(AndroidJUnit4.class)
public class OneTapNavbarNonFuncTest {
    /*
    IF YOU RUN INTO INCOMPATIBLE CLASS CHANGE ERROR, RUN EACH SUBTEST INDIVIDUALLY
    */
    static Intent intent;

    /*
     * Since we are bypassing the sign-in, we need to mock up the entry process,
     * and use a special testing account.
     */
    static {
        TaskSocketHandler.setSocket();
        intent = new Intent(ApplicationProvider.getApplicationContext(), HomepageActivity.class);
        intent.putExtra("accountGoogleName", "justin");
        intent.putExtra("accountGoogleProfilePictureImageUrl", "https://cdn.discordapp.com/attachments/841554131654279198/931329041804431431/20220107_190358.jpg?ex=65691ac2&is=6556a5c2&hm=bb37bcf4cb769296937314852998a1806d901fb86f18372bf284a5d87d4b8f08&");
        intent.putExtra("accountUserId", "12345");
        intent.putExtra("accountIdToken", "12345");
    }

    @Rule
    public ActivityScenarioRule<AppEntryActivity> mActivityScenarioRule =
            new ActivityScenarioRule<>(intent);

    @Before
    public void setUp() {
        Intents.init();
    }

    @After
    public void tearDown() {
        Intents.release();
    }

    @Test
    public void homepageSubPagesTest() throws InterruptedException {
        Thread.sleep(3000);
        // starting with homepage entry
        onView(withId(R.id.homepage_tasks_list_view)).check(matches(isDisplayed()));
        OneTapNavBarCheck();
        Thread.sleep(1000);
        onView(withId(R.id.homepage_tasks_list_view)).check(matches(isDisplayed()));

        // homepage -> tasks list
        onView(withId(R.id.homepage_tasks_forward_arrow_image_view)).perform(click());
        Thread.sleep(1000);
        onView(withId(R.id.tasks_title_text_view)).check(matches(isDisplayed()));
        OneTapNavBarCheck();
        Thread.sleep(1000);
        onView(withId(R.id.tasks_title_text_view)).check(matches(isDisplayed()));
    }

    @Test
    public void myGardenSubPagesTest() throws InterruptedException {
        Thread.sleep(3000);
        // my garden
        onView(withId(R.id.button_navbar_garden)).perform(click());
        Thread.sleep(1000);
        onView(withId(R.id.my_garden_plus_button)).check(matches(isDisplayed()));
        OneTapNavBarCheck();
        Thread.sleep(1000);
        onView(withId(R.id.my_garden_plus_button)).check(matches(isDisplayed()));
    }

    @Test
    public void accountSubPagesTest() throws InterruptedException {
        Thread.sleep(3000);
        // my account
        onView(withId(R.id.button_navbar_account)).perform(click());
        Thread.sleep(1000);
        onView(withId(R.id.account_header_text)).check(matches(isDisplayed()));
        OneTapNavBarCheck();
        Thread.sleep(1000);
        onView(withId(R.id.account_header_text)).check(matches(isDisplayed()));

        // my account -> profile
        onView(withId(R.id.account_profile_button_view)).perform(click());
        Thread.sleep(1000);
        onView(withId(R.id.edit_profile_header)).check(matches(isDisplayed()));
        OneTapNavBarCheck();
        Thread.sleep(1000);
        onView(withId(R.id.edit_profile_header)).check(matches(isDisplayed()));

        // my account -> roles
        onView(withId(R.id.button_navbar_account)).perform(click());
        Thread.sleep(1000);
        onView(withId(R.id.account_roles_button_view)).perform(click());
        Thread.sleep(1000);
        onView(withId(R.id.roles_title_text_view)).check(matches(isDisplayed()));
        OneTapNavBarCheck();
        Thread.sleep(1000);
        onView(withId(R.id.roles_title_text_view)).check(matches(isDisplayed()));

        // my account -> rating
        onView(withId(R.id.button_navbar_account)).perform(click());
        Thread.sleep(1000);
        onView(withId(R.id.rating_button)).perform(click());
        Thread.sleep(1000);
        onView(withId(R.id.rating_header)).check(matches(isDisplayed()));
        OneTapNavBarCheck();
        Thread.sleep(1000);
        onView(withId(R.id.rating_header)).check(matches(isDisplayed()));

        // my account -> new garden application
        onView(withId(R.id.button_navbar_account)).perform(click());
        Thread.sleep(1000);
        onView(withId(R.id.account_apply_button)).perform(click());
        Thread.sleep(1000);
        onView(withId(R.id.garden_application_header)).check(matches(isDisplayed()));
        OneTapNavBarCheck();
        Thread.sleep(1000);
        onView(withId(R.id.garden_application_header)).check(matches(isDisplayed()));

        // admin mode -> garden applications
        onView(withId(R.id.admin_homepage_garden_applications_forward_arrow)).perform(click());
        Thread.sleep(1000);
        onView(withId(R.id.garden_applications_back_arrow)).check(matches(isDisplayed()));
        OneTapNavBarCheck();
        Thread.sleep(1000);
        onView(withId(R.id.garden_applications_back_arrow)).check(matches(isDisplayed()));
    }


    private void OneTapNavBarCheck() throws InterruptedException {
        // verify that navbar buttons are present on the current page
        Thread.sleep(1000);
        onView(withId(R.id.button_navbar_garden)).check(matches(isDisplayed()));
        onView(withId(R.id.button_navbar_home)).check(matches(isDisplayed()));
        onView(withId(R.id.button_navbar_account)).check(matches(isDisplayed()));

        // go to my garden page
        onView(withId(R.id.button_navbar_garden)).perform(click());
        Thread.sleep(1000);
        onView(withId(R.id.my_garden_header_text)).check(matches(isDisplayed()));

        // return to original activity
        pressBack();

        // go to my account page
        onView(withId(R.id.button_navbar_account)).perform(click());
        Thread.sleep(1000);
        onView(withId(R.id.account_header_text)).check(matches(isDisplayed()));

        // return to original activity
        pressBack();

        // go to homepage
        onView(withId(R.id.button_navbar_home)).perform(click());
        Thread.sleep(1000);
        onView(withId(R.id.homepage_tasks_list_view)).check(matches(isDisplayed()));

        // return to original activity
        pressBack();
    }

}
