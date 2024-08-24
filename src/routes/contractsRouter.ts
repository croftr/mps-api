import express, { Request, Response } from 'express';
import { getContractsAwardedByCount, getContractsforOrg, queryContracts, getContractDetails } from "../databases/neoManager";

import { ParsedQs } from 'qs'; 

const contractsRouter = express.Router();

function getQueryParam(query: ParsedQs, paramName: string, defaultValue?: string | number | boolean): string | number | boolean | undefined {
  const value = query[paramName];

  if (typeof value === 'string') {
    // Check for common boolean representations (case-insensitive)
    if (value.toLowerCase() === 'true' || value === '1' || value.toLowerCase() === 'yes') {
      return true;
    } else if (value.toLowerCase() === 'false' || value === '0' || value.toLowerCase() === 'no') {
      return false;
    } else {
      return value; // Return the string value if it's not a recognized boolean
    }
  } else if (typeof defaultValue === 'number' && typeof value !== 'undefined') {
    return Number(value) || defaultValue; // Parse as number, or use default
  } else {
    return defaultValue; // Fallback to the default value or undefined
  }
}

contractsRouter.get('/', async (req: Request, res: Response) => {

  const awardedCount = getQueryParam(req.query, 'awardedCount', 0) as number;
  const orgName = getQueryParam(req.query, 'orgName', "Any") as string;
  const awardedBy = getQueryParam(req.query, 'awardedBy', "Any Party") as string;
  const contractName = getQueryParam(req.query, 'contractName', "Any") as string;
  const industry = getQueryParam(req.query, 'industry', "Any") as string;
  const contractFromDate = getQueryParam(req.query, 'contractFromDate') as string | undefined;
  const contractToDate = getQueryParam(req.query, 'contractToDate') as string | undefined;
  const limit = getQueryParam(req.query, 'limit', 1000) as number;
  const valueFrom = getQueryParam(req.query, 'valuefrom', 0) as number;
  const valueTo = getQueryParam(req.query, 'valueto', 99999999999) as number;
  const groupByContractCount = getQueryParam(req.query, 'groupByContractCount', false) as boolean;

  let result;
  
  result = await queryContracts({
    awardedCount,
    orgName,
    awardedBy,
    limit,
    groupByContractCount,
    contractFromDate,
    contractToDate,
    title: contractName, 
    industry,
    valueFrom,
    valueTo
  });

  // @ts-ignore
  if (result && result.records) {
    // @ts-ignore
    res.json(result.records);
  } else {
    res.json({})
  }

});


contractsRouter.get('/details', async (req: Request, res: Response) => {

  const value: number = Number(req?.query?.value) || 0;

  const supplier = req?.query?.supplier;

  const title = req?.query?.title;


  let result;

  // @ts-ignore
  result = await getContractDetails({ value, title, supplier });


  // @ts-ignore
  if (result && result.records) {
    // @ts-ignore
    res.json(result.records);
  } else {
    res.json({})
  }

});

export default contractsRouter;
