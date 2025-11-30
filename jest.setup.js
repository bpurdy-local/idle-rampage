// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-iap
jest.mock('react-native-iap', () => ({
  initConnection: jest.fn(),
  endConnection: jest.fn(),
  getProducts: jest.fn(),
  requestPurchase: jest.fn(),
  finishTransaction: jest.fn(),
  purchaseUpdatedListener: jest.fn(() => ({remove: jest.fn()})),
  purchaseErrorListener: jest.fn(() => ({remove: jest.fn()})),
  getAvailablePurchases: jest.fn(),
}));

// react-native-reanimated mock is in __mocks__/react-native-reanimated.js
