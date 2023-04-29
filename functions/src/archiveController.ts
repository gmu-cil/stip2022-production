import {Response} from 'express';
// import {Request} from 'express';
import {database} from './config/firebase';

const allArchies = async (req: unknown, res: Response) => {
  // const alphabet = req.params.alphabet;
  try {
    // eslint-disable-next-line max-len
    await database
        .ref(`/persons/requestArchieve/persons`)
        .once('value', (v) => {
          const o = v.val();
          if (!o) {
            throw new Error('No data');
          } else {
            res.status(200).send({
              message: 'allArchies',
              status: 'success',
              data: o,
            });
          }
        });
  } catch (error) {
    res.status(500).send({
      message: 'allArchies',
      status: 'error',
      data: error,
    });
  }
};

export {allArchies};
