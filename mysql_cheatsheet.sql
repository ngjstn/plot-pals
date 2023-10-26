/*
* CHEATSHEET
*/

/*
* Tips: 
*	1. Run commands by selecting the line where the command is and then clicking on the lighting bold with I symbol rather than running the entire page
*	2. Each command ends with a semicolon
* 	3. You can see the types of fields and whether a field is nullable for a table by right-clicking one of the tables in the 'Navigator' to your left
*	   and then clicking 'Table Inspector'. In the page popup, you will see an option at the top called 'Columns' that you can click to see the constraints of each column
*	   in the table
*/

/*INSTRUCTIONS TO SHOW DATA INSIDE TABLES*/
SELECT * FROM profiles;
SELECT * FROM gardens;
SELECT * FROM plots;
SELECT * FROM tasks;
SELECT * FROM admin_profiles;
SELECT * FROM reports;
SELECT * FROM updates;

/* INSERT STATEMENTS TEMPLATE TO INITIALIZE TEST DATA FOR NON-PROFILE TABLES */
INSERT INTO gardens(address, longitude, latitude, gardenOwnerId, isApproved, gardenPicture, contactPhoneNumber, contactEmail, numberOfPlots) 
	VALUES ('some address', 38.8951 /*some longitude with 4 decimals*/, -77.0364 /*some latitude with 4 decimals*/, '{insert some profile.id}', false, NULL /*deal with pictures later*/, 'some phone number', 'some email', 10 /*any int you want*/); 
INSERT INTO plots(gardenId, plotOwnerId) VALUES (123 /*some int from garden.id */, '{insert some profile.id}');
INSERT INTO tasks(plotId, reward, minimumRating, description, assignerId, assigneeId, isCompleted, assigneeIsProvidedFeedback, gardenId, deadlineDate, taskStartTime, taskEndTime, expectedTaskDurationInHours)
	VALUES (123 /*some plot.id int*/, 'some reward', 4.56 /*some number between 0-5 with 2 decimals*/, 'some desc', '{insert some profile.id}', '{insert some profile.id}', false, false, 123 /*some garden id*/, '2023-01-01 10:00:00' /*YYYY-MM-DD*/, '2023-03-01 10:00:00' /*YYYY-MM-DD*/, 100 /*some int*/);
INSERT INTO reports(reportedId, reporteeId, reason, comment) VALUES ('{insert some profile.id}', '{insert some profile.id}', "some reason", "some comment");
INSERT INTO updates(userId, description, title) VALUES ('{insert your profile.id}', "some test description", "some title");

/* UPDATE STATEMENT TEMPLATE */
/* UPDATE table_name SET column1 = value1, column2 = value2, ... WHERE condition; */

/* DELETE STATEMENT TEMPLATE */
/* DELETE FROM table_name WHERE condition; */



