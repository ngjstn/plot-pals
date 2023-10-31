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
SELECT * FROM tasks;
SELECT * FROM admin_profiles;
SELECT * FROM reports;
SELECT * FROM updates;

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

INSERT INTO tasks(
	plotId, 
	reward, 
	minimumRating, 
    title,
	description, 
	assignerId, 
	assigneeId, 
	isCompleted, 
	assigneeIsProvidedFeedback, 
	gardenId, 
	deadlineDate, 
	taskStartTime, 
	taskEndTime, 
	expectedTaskDurationInHours
) VALUES (
	123 /*some plot.id int*/, 
	'some reward', 
	4.56 /*some number between 0-5 with 2 decimals*/, 
    'some title',
	'some desc', 
	'{insert some profile.id}', 
	'{insert some profile.id}', 
	false, 
	false, 
	123 /*some garden id*/, 
	'2023-04-01 10:00:00' /*YYYY-MM-DD*/, 
	'2023-01-01 10:00:00' /*YYYY-MM-DD*/, 
	'2023-03-01 10:00:00' /*YYYY-MM-DD*/, 
	100 /*some int*/
);
INSERT INTO reports(
	reportedId, 
	reporteeId, 
	reason, 
	comment
) VALUES (
	'{insert some profile.id}',
	'{insert some profile.id}', 
	'some reason', 
	'some comment'
);

INSERT INTO updates(
	userId, 
	description, 
	title
) VALUES (
	'{insert your profile.id}', 
	"some test description", 
	"some title"
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

/*
* Some commands I ran in the past
*/
UPDATE tasks SET assignerId='108353760268997269925', assigneeId='108438399361533648066' where tasks.id = 1;

UPDATE roles SET roleNum=1 WHERE profileId = '108438399361533648066' AND gardenId = 1;

INSERT INTO plots(
	gardenId, 
	plotOwnerId
) VALUES (
	3, 
	'102251803449216000773'
);

INSERT INTO roles(
	profileId, 
    gardenId,
    roleNum
) VALUES (
	'108353760268997269925',
    4 /* Some Garden.id here */,
    0 /* Some role number here ( SEE NOTES ON cpen_321_database_design.txt for the role enums) */
);

INSERT INTO tasks(
	plotId, 
	reward, 
	minimumRating, 
    title,
	description, 
	assignerId, 
	assigneeId, 
	isCompleted, 
	assigneeIsProvidedFeedback, 
	gardenId, 
	deadlineDate, 
	taskStartTime, 
	taskEndTime, 
	expectedTaskDurationInHours
) VALUES (
	2 /*some plot.id int*/, 
	'a potato', 
	4.16 /*some number between 0-5 with 2 decimals*/, 
    'test task 123',
	'some desc', 
	'108438399361533648066', 
	'108353760268997269925', 
	false, 
	false, 
	1 /*some garden id*/, 
	'2023-04-01 10:00:00' /*YYYY-MM-DD*/, 
	'2023-01-01 10:00:00' /*YYYY-MM-DD*/, 
	'2023-03-01 10:00:00' /*YYYY-MM-DD*/, 
	100 /*some int*/
);

UPDATE roles SET gardenOwnerId='108438399361533648066' WHERE id=4;

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
    'address foobar', 
    -122.0859 /*some longitude with 4 decimals*/, 
    37.4219 /*some latitude with 4 decimals*/, 
    '103354493506323780957', 
    false, 
    NULL /*deal with pictures later*/, 
    '7786513472', 
    'fizzbuzz@gmail.com',
    12 /*any int you want*/, 
    'garden for extra gardening'
); 

