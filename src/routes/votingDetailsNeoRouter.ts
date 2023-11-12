import { log } from 'console';
import express, { Request, Response } from 'express';
import { votedNo, votedAye, voted } from "../databases/neoManager";

const logger = require('../logger');

const votingDetailsNeoRouter = express.Router();

votingDetailsNeoRouter.get('/', async (req: Request, res: Response) => {

  const id: any = Number(req?.query?.id);
  const type = req?.query?.type;

  // @ts-ignore
  const fromDate: string = req?.query?.fromDate;
  // @ts-ignore
  const toDate: string = req?.query?.toDate;

  let result: any;
  if (type === 'votedAye') {
    result = await votedAye(id, fromDate, toDate);
  } else if (type === 'votedNo') {
    result = await votedNo(id, fromDate, toDate);
  } else {
    result = await voted(id, fromDate, toDate);
  }

  res.json(result);

});


export default votingDetailsNeoRouter;
