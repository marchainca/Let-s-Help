import { FirebaseConfig } from './firebase.config';

describe('FirebaseConfig', () => {
  it('should be defined', () => {
    expect(new FirebaseConfig()).toBeDefined();
  });
});
