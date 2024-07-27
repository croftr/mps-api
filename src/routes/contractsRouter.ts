import express, { Request, Response } from 'express';
import { getContractsAwardedByCount, getContractsforOrg, queryContracts } from "../databases/neoManager";

const contractsRouter = express.Router();

contractsRouter.get('/', async (req: Request, res: Response) => {

  const awardedCount: number = Number(req?.query?.awardedCount) || 0;

  const orgName = req?.query?.orgName || "Any";

  const awardedBy = req?.query?.awardedBy || "Any Party";

  const limit: number = Number(req?.query?.limit) || 1000;

  const groupByContractCount: boolean = req?.query?.groupByContractCount === "true" ? true : false;


  let result;

  // @ts-ignore
  result = await queryContracts({ awardedCount, orgName, awardedBy, limit, groupByContractCount });


  // @ts-ignore
  if (result && result.records) {
    // @ts-ignore
    res.json(result.records);
  } else {
    res.json({})
  }

});


export default contractsRouter;
