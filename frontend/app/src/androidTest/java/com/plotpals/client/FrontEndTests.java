package com.plotpals.client;


import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.action.ViewActions.closeSoftKeyboard;
import static androidx.test.espresso.action.ViewActions.replaceText;
import static androidx.test.espresso.action.ViewActions.scrollTo;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;
import static androidx.test.espresso.matcher.ViewMatchers.withClassName;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static androidx.test.espresso.matcher.ViewMatchers.withParent;
import static androidx.test.espresso.matcher.ViewMatchers.withText;
import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.is;

import android.content.Intent;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;

import androidx.test.core.app.ApplicationProvider;
import androidx.test.espresso.ViewInteraction;
import androidx.test.espresso.intent.Intents;
import androidx.test.ext.junit.rules.ActivityScenarioRule;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.filters.LargeTest;

import com.plotpals.client.utils.TaskSocketHandler;

import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.hamcrest.TypeSafeMatcher;
import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.util.Random;

@LargeTest
@RunWith(AndroidJUnit4.class)
public class FrontEndTests {

    static Intent intent;
    static String LEXICON = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    static int taskNameMax = 20;
    static int taskNameMin = 10;

    /*
     * Since we are bypassing the sign-in, we need to mock up the entry process,
     * and use a special testing account.
     */
    static {
        TaskSocketHandler.setSocket();
        intent = new Intent(ApplicationProvider.getApplicationContext(), HomepageActivity.class);
        intent.putExtra("accountGoogleName", "alan");
        intent.putExtra("accountGoogleProfilePictureImageUrl", "https://avatars.githubusercontent.com/u/57464218?s=400&u=e37a25b70523e5da18b6653c8ccbf3373d7aa289&v=4");
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
    public void addTaskForumBoardTest() {

        try {

            String taskName = getRandomString();

            ViewInteraction appCompatButton = onView(
                    allOf(withId(R.id.button_navbar_garden),
                            childAtPosition(
                                    allOf(withId(R.id.navbar),
                                            childAtPosition(
                                                    withClassName(is("androidx.constraintlayout.widget.ConstraintLayout")),
                                                    0)),
                                    1),
                            isDisplayed()));
            appCompatButton.perform(click());

            ViewInteraction appCompatButton2 = onView(
                    childAtPosition(
                            childAtPosition(
                                    withId(R.id.my_garden_scrollview_layout),
                                    0),
                            2));
            appCompatButton2.perform(scrollTo(), click());

            ViewInteraction appCompatImageView = onView(
                    allOf(withId(R.id.forum_board_plus),
                            childAtPosition(
                                    childAtPosition(
                                            withId(android.R.id.content),
                                            0),
                                    4),
                            isDisplayed()));
            appCompatImageView.perform(click());

            ViewInteraction appCompatTextView = onView(
                    allOf(withId(R.id.forum_board_new_task), withText("New Task"),
                            childAtPosition(
                                    childAtPosition(
                                            withId(android.R.id.content),
                                            0),
                                    6),
                            isDisplayed()));
            appCompatTextView.perform(click());

            ViewInteraction appCompatImageView2 = onView(
                    allOf(withId(R.id.forum_board_new_task_check),
                            childAtPosition(
                                    childAtPosition(
                                            withId(android.R.id.content),
                                            0),
                                    12),
                            isDisplayed()));
            appCompatImageView2.perform(click());

            ViewInteraction appCompatImageView3 = onView(
                    allOf(withId(R.id.forum_board_new_task_check),
                            childAtPosition(
                                    childAtPosition(
                                            withId(android.R.id.content),
                                            0),
                                    12),
                            isDisplayed()));
            appCompatImageView3.perform(click());

            ViewInteraction appCompatEditText = onView(
                    allOf(withId(R.id.forum_board_new_task_title),
                            childAtPosition(
                                    childAtPosition(
                                            withId(android.R.id.content),
                                            0),
                                    3),
                            isDisplayed()));
            appCompatEditText.perform(replaceText(taskName), closeSoftKeyboard());

            ViewInteraction appCompatEditText2 = onView(
                    allOf(withId(R.id.forum_board_new_task_body),
                            childAtPosition(
                                    childAtPosition(
                                            withId(android.R.id.content),
                                            0),
                                    5),
                            isDisplayed()));
            appCompatEditText2.perform(replaceText("Testing 123"), closeSoftKeyboard());

            ViewInteraction appCompatEditText3 = onView(
                    allOf(withId(R.id.forum_board_new_task_expected),
                            childAtPosition(
                                    childAtPosition(
                                            withId(android.R.id.content),
                                            0),
                                    2),
                            isDisplayed()));
            appCompatEditText3.perform(replaceText("12"), closeSoftKeyboard());

            ViewInteraction appCompatEditText4 = onView(
                    allOf(withId(R.id.forum_board_new_task_deadline),
                            childAtPosition(
                                    childAtPosition(
                                            withId(android.R.id.content),
                                            0),
                                    1),
                            isDisplayed()));
            appCompatEditText4.perform(replaceText("12122002"), closeSoftKeyboard());

            ViewInteraction appCompatEditText5 = onView(
                    allOf(withId(R.id.forum_board_new_task_reward),
                            childAtPosition(
                                    childAtPosition(
                                            withId(android.R.id.content),
                                            0),
                                    6),
                            isDisplayed()));
            appCompatEditText5.perform(replaceText("Pizza!"), closeSoftKeyboard());

            ViewInteraction appCompatImageView4 = onView(
                    allOf(withId(R.id.forum_board_new_task_check),
                            childAtPosition(
                                    childAtPosition(
                                            withId(android.R.id.content),
                                            0),
                                    12),
                            isDisplayed()));
            appCompatImageView4.perform(click());

            ViewInteraction appCompatEditText6 = onView(
                    allOf(withId(R.id.forum_board_new_task_deadline), withText("12122002"),
                            childAtPosition(
                                    childAtPosition(
                                            withId(android.R.id.content),
                                            0),
                                    1),
                            isDisplayed()));
            appCompatEditText6.perform(replaceText("12122222"));

            ViewInteraction appCompatEditText7 = onView(
                    allOf(withId(R.id.forum_board_new_task_deadline), withText("12122222"),
                            childAtPosition(
                                    childAtPosition(
                                            withId(android.R.id.content),
                                            0),
                                    1),
                            isDisplayed()));
            appCompatEditText7.perform(closeSoftKeyboard());

            ViewInteraction appCompatImageView5 = onView(
                    allOf(withId(R.id.forum_board_new_task_check),
                            childAtPosition(
                                    childAtPosition(
                                            withId(android.R.id.content),
                                            0),
                                    12),
                            isDisplayed()));
            appCompatImageView5.perform(click());

            // Give time for backend to update
            Thread.sleep(500);

            ViewInteraction textView = onView(
                    allOf(withId(R.id.forum_board_task_preview_title), withText(taskName),
                            withParent(withParent(withId(R.id.forum_board_scrollview_layout)))));
            textView.check(matches(withText(taskName)));

        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }

    }

    /*
     * !!! Important !!!
     *
     * As this test is testing interaction between two users, manual setup is required,
     * as mentioned in https://piazza.com/class/lltpo77rrjohx/post/327.
     *
     * Set up:
     * 1. Run the addTaskForumBoardTest() test, which will create a task for you.
     * 2. Open the app on the emulator using a personal account.
     * 3. Navigate to your account and take a look at your rating. Keep it in mind.
     * 4. If you have not yet, navigate to the map, search, and join "Automated Test Garden".
     * 5. Navigate to your gardens, and then to the "Automated Test Garden" forum board.
     * 6. Click the first (top) task, which should be newly created one.
     * 7. Accept the task, and then complete the task.
     *
     * Now, you may run this test.
     *
     * After test:
     * On your personal account, navigate to your account and check the rating.
     * It should have decreased dramatically (The test gives you a rating of 0).
     */
    @Test
    public void completeTaskFeedbackTest() {
        try {
            Thread.sleep(9999999);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }

    private static Matcher<View> childAtPosition(
            final Matcher<View> parentMatcher, final int position) {

        return new TypeSafeMatcher<View>() {
            @Override
            public void describeTo(Description description) {
                description.appendText("Child at position " + position + " in parent ");
                parentMatcher.describeTo(description);
            }

            @Override
            public boolean matchesSafely(View view) {
                ViewParent parent = view.getParent();
                return parent instanceof ViewGroup && parentMatcher.matches(parent)
                        && view.equals(((ViewGroup) parent).getChildAt(position));
            }
        };
    }

    private String getRandomString() {
        Random random = new Random();
        int size = random.nextInt(taskNameMax - taskNameMin) + taskNameMin;
        final StringBuilder sb = new StringBuilder(size);
        for (int i = 0; i < size; ++i)
            sb.append(LEXICON.charAt(random.nextInt(LEXICON.length())));
        return sb.toString();
    }

}
