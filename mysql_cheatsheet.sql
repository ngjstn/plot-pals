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
SELECT * FROM roles;
SELECT * FROM gardens;
SELECT * FROM plots;
SELECT * FROM posts;
SELECT * FROM tasks;
SELECT * FROM admin_profiles;

/* INSERT STATEMENTS TEMPLATE TO INITIALIZE TEST DATA FOR NON-PROFILE TABLES */
INSERT INTO roles(
	profileId, 
    gardenId,
    roleNum
) VALUES (
	'{insert some Profile.id here}',
    123 /* Some Garden.id here */,
    0 /* Some role number here ( SEE NOTES ON cpen_321_database_design.txt for the role enums) */
);

INSERT INTO gardens(
	address, 
    longitude, 
    latitude, 
    gardenOwnerId, 
    isApproved, 
    gardenPicture, 
    contactPhoneNumber, 
    contactEmail, 
    numberOfPlots, 
    gardenName
) VALUES (
    'some address', 
    38.8951 /*some longitude with 4 decimals*/, 
    -77.0364 /*some latitude with 4 decimals*/, 
    '{insert some profile.id}', 
    false, 
    NULL /*deal with pictures later*/, 
    'some phone number', 
    'some email',
    10 /*any int you want*/, 
    'some garden name'
); 

INSERT INTO plots(
	gardenId, 
	plotOwnerId
) VALUES (
	123 /*some int from garden.id */, 
	'{insert some profile.id}'
);

INSERT INTO posts (
	title,
    description,
    taskId,
    assignerId, 
    postGardenId
) VALUES (
	"some title",
    "some description",
    123 /* insert some tasks.id or null if post is not a task */,
    "{some profiles.id}" /* Id of person who creates post/task, references profiles.id */,
    123 /* insert some garden.id */
    
);

INSERT INTO tasks(
	plotId, 
	reward, 
	minimumRating, 
	assigneeId, 
	isCompleted, 
	assigneeIsProvidedFeedback, 
	deadlineDate, 
	taskStartTime, 
	taskEndTime, 
	expectedTaskDurationInHours
) VALUES (
	123 /*some plot.id int*/, 
	'some reward', 
	4.56 /*some number between 0-5 with 2 decimals*/, 
	'{insert some profile.id}', 
	false, 
	false, 
	'2023-04-01 10:00:00' /*YYYY-MM-DD*/, 
	'2023-01-01 10:00:00' /*YYYY-MM-DD*/, 
	'2023-03-01 10:00:00' /*YYYY-MM-DD*/, 
	100 /*some int*/
);

/* UPDATE STATEMENT TEMPLATE */
/* UPDATE table_name SET column1 = value1, column2 = value2, ... WHERE condition; */

/* DELETE STATEMENT TEMPLATE */
/* DELETE FROM table_name WHERE condition; */

/* 
*  JOINS EXAMPLE 
*  joins are your bestfriend when trying to avoid multiple api calls. Below you will see an
*  example of querying tasks and adding a column specifying the name of the garden the task is for
*/
SELECT
    tasks.*,
    gardens.gardenName
FROM tasks JOIN gardens
ON tasks.gardenId = gardens.id;