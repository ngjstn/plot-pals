const randomPostsAndTasks = [
  Object.freeze({
    id: 1,
    title: 'some title',
    description: 'some description',
    assignerId: '1235234231',
    postGardenId: 1,
    gardenName: 'foobar',
    assignerName: 'foo',
    taskId: 4,
    plotId: null,
    reward: 'foo',
    minimumRating: 3.5,
    assigneeId: '2342123142',
    isCompleted: 0,
    assigneeIsProvidedFeedback: 0,
    deadlineDate: '2023-03-01 10:00:00',
    taskStartTime: '2023-03-01 10:00:00',
    taskEndTime: '2023-03-01 10:00:00',
    expectedTaskDurationInHours: 2314,
    assigneeName: 'foobar 2',
  }),
];

module.exports = {
  randomPostsAndTasks,
};
