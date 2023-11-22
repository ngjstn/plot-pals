package com.plotpals.client;


import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.action.ViewActions.closeSoftKeyboard;
import static androidx.test.espresso.action.ViewActions.replaceText;
import static androidx.test.espresso.action.ViewActions.scrollTo;
import static androidx.test.espresso.assertion.ViewAssertions.doesNotExist;
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
import org.junit.FixMethodOrder;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.MethodSorters;

import java.util.Random;

@FixMethodOrder(MethodSorters.NAME_ASCENDING)
@RunWith(AndroidJUnit4.class)
public class DynamicForumTaskUpdateNonFuncTest {

    static Intent intent;
    static String LEXICON = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    static int taskNameMax = 20;
    static int taskNameMin = 10;
    final static String taskName = getRandomString();

    /*
     * Since we are bypassing the sign-in, we need to mock up the entry process,
     * and use a special testing account.
     */
    static {
        TaskSocketHandler.setSocket();
        intent = new Intent(ApplicationProvider.getApplicationContext(), HomepageActivity.class);
        intent.putExtra("accountGoogleName", "alan");
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
    public void AddTaskToForumBoardTest() {
        try {
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

    @Test
    public void VolunteerTaskTest() throws InterruptedException {
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

        ViewInteraction appCompatTextView = onView(
                allOf(withId(R.id.forum_board_task_preview_title), withText(taskName),
                        withParent(withParent(withId(R.id.forum_board_scrollview_layout)))));
        Thread.sleep(1000);
        appCompatTextView.perform(click());

        ViewInteraction textView = onView(
                allOf(withId(R.id.forum_Board_task_assignee), withText("null"),
                        withParent(withParent(withId(android.R.id.content))),
                        isDisplayed()));
        textView.check(matches(withText("null")));

        ViewInteraction appCompatButton3 = onView(
                allOf(withId(R.id.forum_board_task_button), withText("Volunteer for this task"),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                18),
                        isDisplayed()));
        appCompatButton3.perform(click());

        // max 5 seconds to wait for the task to dynamically update via socket
        Thread.sleep(5000);

        ViewInteraction textView2 = onView(
                allOf(withId(R.id.forum_Board_task_assignee), withText("alan"),
                        withParent(withParent(withId(android.R.id.content))),
                        isDisplayed()));
        textView2.check(matches(withText("alan")));

        // mark task as completed
        ViewInteraction appCompatButton4 = onView(
                allOf(withId(R.id.forum_board_task_button), withText("Mark task as completed"),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                18),
                        isDisplayed()));
        appCompatButton4.perform(click());

        // max 5 seconds to wait for the task to dynamically update via socket
        Thread.sleep(5000);

        ViewInteraction textView3 = onView(
                allOf(withId(R.id.forum_Board_task_status), withText("Complete"),
                        withParent(withParent(withId(android.R.id.content))),
                        isDisplayed()));
        textView3.check(matches(withText("Complete")));
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

    private static String getRandomString() {
        Random random = new Random();
        int size = random.nextInt(taskNameMax - taskNameMin) + taskNameMin;
        final StringBuilder sb = new StringBuilder(size);
        for (int i = 0; i < size; ++i)
            sb.append(LEXICON.charAt(random.nextInt(LEXICON.length())));
        return sb.toString();
    }
}
