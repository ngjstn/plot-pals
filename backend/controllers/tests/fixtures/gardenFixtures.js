// Fixtures with garbage data for testing garden controller. Note that fields shown are not
// all from the gardens table as we implemented joining in the sql statements of the garden controller functions

const randomGardensWithoutAuthorizedUserDiscrimination = [
  Object.freeze({
    id: 1,
    address: '5849 Diamond Hill',
    latitude: '32.3425',
    longitude: '-120.5342',
    gardenOwnerId: 4,
    isApproved: 1,
    contactPhoneNumber: '778-944-2342',
    contactEmail: 'foo@gmail.com',
    numberOfPlots: 23,
    gardenName: 'some garden',
    gardenOwnerName: 'some garden owner',
  }),
  Object.freeze({
    id: 2,
    address: '5849 Diamond Mountain',
    latitude: '32.5425',
    longitude: '-120.5242',
    gardenOwnerId: 1,
    isApproved: 0,
    contactPhoneNumber: '778-945-2342',
    contactEmail: 'foobar@gmail.com',
    numberOfPlots: 23,
    gardenName: 'some garden but better',
    gardenOwnerName: 'better garden owner',
  }),
];

const randomGardensWithAuthorizedUserDiscrimination = [
    Object.freeze({
      id: 3,
      address: '5849 Diamond Hill',
      latitude: '32.3425',
      longitude: '-120.5342',
      gardenOwnerId: 4,
      isApproved: 1,
      contactPhoneNumber: '778-944-2342',
      contactEmail: 'foo@gmail.com',
      numberOfPlots: 23,
      gardenName: 'some garden',
      gardenOwnerName: 'some garden owner',
      roleNumOfCurrentAuthorizedUserInGarden: 2
    }),
    Object.freeze({
      id: 4,
      address: '5849 Diamond Mountain',
      latitude: '32.5425',
      longitude: '-120.5242',
      gardenOwnerId: 1,
      isApproved: 0,
      contactPhoneNumber: '778-945-2342',
      contactEmail: 'foobar@gmail.com',
      numberOfPlots: 23,
      gardenName: 'some garden but better',
      gardenOwnerName: 'better garden owner',
      roleNumOfCurrentAuthorizedUserInGarden: 0
    }),
  ];
module.exports = {
  randomGardensWithoutAuthorizedUserDiscrimination,
  randomGardensWithAuthorizedUserDiscrimination
};
