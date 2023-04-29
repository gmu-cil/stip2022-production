import {fireStore} from './config/firebase';

const testFetchDetails = async (_, __) => {
  // eslint-disable-next-line max-len
  const j = await fireStore.collection(`publics`).get();
  try {
    return j.docs.map((item) => item.data());
  } catch (error) {
    return error;
  }
};

export {testFetchDetails};
