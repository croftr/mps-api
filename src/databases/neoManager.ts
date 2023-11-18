import { log } from 'console';
import { Division } from '../models/divisions';
import { Mp } from '../models/mps';
import { VotedFor } from '../models/relationships';
import neo4j from "neo4j-driver";
import { cyphers } from "./cyphers";

const EARLIEST_FROM_DATE = "2015-01-01";

const logger = require('../logger');
//hello
let CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
// let CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
let driver: any;

const objectToStringWithoutQuotes = (obj: any) => {
    let result = '{';

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            result += key + ':' + JSON.stringify(obj[key]) + ',';
        }
    }

    // Remove the trailing comma if there are properties
    if (result.length > 1) {
        result = result.slice(0, -1);
    }

    result += '}';
    return result;
}

const runCypher = async (cypher: string, session: any) => {
    logger.trace(cypher);
    try {
        const result = await session.run(cypher);
        return result;
    } catch (error) {
        logger.error("ERROR RUNNING CYPHER: " + error);
    }
}

export const getMpNames = async () => {

    logger.debug('Getting MP Names...');

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(`MATCH (n:Mp) RETURN n.nameDisplayAs, n.id`, session);
        return result;
    } finally {
        session.close();
    }
}

export const getDivisionNames = async () => {

    logger.debug('Getting DIVISION Names...');

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(`MATCH (n:Division) RETURN n.Title, n.DivisionId`, session);
        return result;
    } finally {
        session.close();
    }
}

/**
 * 
 * @param value expected format 2002-09-22
 * @returns 
 */
const dateStringToNeo = (value: string) => {
    return objectToStringWithoutQuotes({ year: Number(value.split("-")[0]), month: Number(value.split("-")[1]), day: Number(value.split("-")[2]) });
}

export const totalVotes = async (id: number, fromDate: string = EARLIEST_FROM_DATE, toDate: string) => {

    //set to date to today if not provided 
    if (!toDate) {
        toDate = new Date().toISOString().substr(0, 10);
    }

    const fromDateValue = dateStringToNeo(fromDate);
    const toDateValue = dateStringToNeo(toDate);

    const cypher = `MATCH (s:Mp)-[r:VOTED_FOR]-(d) 
     WHERE (s.id = ${id}) 
     AND d.Date > datetime(${fromDateValue}) 
     AND d.Date < datetime(${toDateValue}) 
     RETURN COUNT(d)`;

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }
}

export const votedAyeCount = async (id: number, fromDate: string = EARLIEST_FROM_DATE, toDate: string) => {

    //set to date to today if not provided 
    if (!toDate) {
        toDate = new Date().toISOString().substr(0, 10);
    }

    const fromDateValue = dateStringToNeo(fromDate);
    const toDateValue = dateStringToNeo(toDate);

    const cypher = `MATCH (s:Mp)-[r:VOTED_FOR]-(d) 
    WHERE (s.id = ${id} 
    AND d.Date > datetime(${fromDateValue}) 
    AND d.Date < datetime(${toDateValue}) 
    AND r.votedAye) RETURN COUNT(*)`;

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }
}

export const votedNoCount = async (id: number, fromDate: string = EARLIEST_FROM_DATE, toDate: string) => {

    //set to date to today if not provided 
    if (!toDate) {
        toDate = new Date().toISOString().substr(0, 10);
    }

    const fromDateValue = dateStringToNeo(fromDate);
    const toDateValue = dateStringToNeo(toDate);

    const cypher = `MATCH (s:Mp)-[r:VOTED_FOR]-(d) 
    WHERE (s.id = ${id} 
    AND d.Date > datetime(${fromDateValue}) 
    AND d.Date < datetime(${toDateValue}) 
    AND NOT r.votedAye) 
    RETURN COUNT(*)`;

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }
}

export const voted = async (id: number, fromDate: string = EARLIEST_FROM_DATE, toDate: string) => {

    //set to date to today if not provided 
    if (!toDate) {
        toDate = new Date().toISOString().substr(0, 10);
    }

    const fromDateValue = dateStringToNeo(fromDate);
    const toDateValue = dateStringToNeo(toDate);

    const cypher = `MATCH (s:Mp)-[r:VOTED_FOR]-(d) 
    WHERE (s.id = ${id}) 
    AND d.Date > datetime(${fromDateValue}) 
    AND d.Date < datetime(${toDateValue}) 
    RETURN d.DivisionId, d.Title, d.Date, r.votedAye`;

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }
}

export const votedAye = async (id: number, fromDate: string = EARLIEST_FROM_DATE, toDate: string) => {

    //set to date to today if not provided 
    if (!toDate) {
        toDate = new Date().toISOString().substr(0, 10);
    }

    const fromDateValue = dateStringToNeo(fromDate);
    const toDateValue = dateStringToNeo(toDate);

    const cypher = `MATCH (s:Mp)-[r:VOTED_FOR]-(d) 
    WHERE (s.id = ${id} AND r.votedAye) 
    AND d.Date > datetime(${fromDateValue}) 
    AND d.Date < datetime(${toDateValue})     
    RETURN d.DivisionId, d.Title, d.Date`;

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }
}

export const votedNo = async (id: number, fromDate: string = EARLIEST_FROM_DATE, toDate: string) => {

    //set to date to today if not provided 
    if (!toDate) {
        toDate = new Date().toISOString().substr(0, 10);
    }

    const fromDateValue = dateStringToNeo(fromDate);
    const toDateValue = dateStringToNeo(toDate);

    const cypher = `MATCH (s:Mp)-[r:VOTED_FOR]-(d) 
    WHERE (s.id = ${id} AND NOT r.votedAye) 
    AND d.Date > datetime(${fromDateValue}) 
    AND d.Date < datetime(${toDateValue}) 
    RETURN d.DivisionId, d.Title, d.Date`;

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }
}

/**
 * find mps with most or least similar voting records
 * TODO - want to include voting types parameter (eg. immigration, EU) and date range (cant work out how to do dates as they are stored on divisions not mps)
 * @param id 
 * @param partyName 
 * @param limit 
 * @param orderBy 
 * @param type 
 * @returns 
 */
export const votingSimilarity = async (id: number, partyName: string, limit: number = 40, orderBy: string = "DESCENDING", type: string) => {

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    const neoIdCypher = `MATCH (n:Mp {id: ${id}}) RETURN ID(n)`;
    let neoId;
    try {
        const neoIdResult = await runCypher(neoIdCypher, session);
        logger.info("check me out >>> " + JSON.stringify(neoIdResult.records));
        neoId = neoIdResult.records[0]._fields[0].low;
        logger.info("reult is " + neoId)

        let cypher;
        if (type === "excludeParty") {
            cypher = cyphers.votingSimilarityParty(neoId, partyName, orderBy, limit, "<>");
        } else if (type === "includeParty") {
            cypher = cyphers.votingSimilarityParty(neoId, partyName, orderBy, limit, "=");
        } else {
            cypher = cyphers.votingSimilarity(neoId, orderBy, limit);
        }
        
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }
}


export const mostOrLeastVotingMps = async (partyName: string, voteCategory: string, partyOperator: string = "=", limit: number = 40, orderBy: string = "DESCENDING", fromDate: string = EARLIEST_FROM_DATE, toDate: string) => {

    //set to date to today if not provided 
    if (!toDate) {
        toDate = new Date().toISOString().substr(0, 10);
    }

    const fromDateValue = objectToStringWithoutQuotes({ year: Number(fromDate.split("-")[0]), month: Number(fromDate.split("-")[1]), day: Number(fromDate.split("-")[2]) });
    const toDateValue = objectToStringWithoutQuotes({ year: Number(toDate.split("-")[0]), month: Number(toDate.split("-")[1]), day: Number(toDate.split("-")[2]) });

    let cypher;

    if (partyName) {

        if (voteCategory) {
            cypher = `MATCH (mp:Mp)-[]-(d:Division)
            WHERE mp.partyName ${partyOperator} "${partyName}"
            AND d.Category = "${voteCategory}"
            AND d.Date > datetime(${fromDateValue}) 
            AND d.Date < datetime(${toDateValue}) 
            WITH mp, COUNT(*) AS voteCount
            ORDER BY voteCount ${orderBy}
            RETURN mp.nameDisplayAs, mp.partyName, voteCount 
            LIMIT ${limit}`;
        } else {
            cypher = `MATCH (mp:Mp)-[]-(d:Division)
            WHERE mp.partyName ${partyOperator} "${partyName}"
            AND d.Date > datetime(${fromDateValue}) 
            AND d.Date < datetime(${toDateValue}) 
            WITH mp, COUNT(*) AS voteCount
            ORDER BY voteCount ${orderBy}
            RETURN mp.nameDisplayAs, mp.partyName, voteCount 
            LIMIT ${limit}`;
        }
    } else {
        if (voteCategory) {
            cypher = `MATCH (mp:Mp)-[]-(d:Division)        
            WHERE d.Category = "${voteCategory}"
            AND d.Date > datetime(${fromDateValue}) 
            AND d.Date < datetime(${toDateValue}) 
            WITH mp, COUNT(*) AS voteCount
            ORDER BY voteCount ${orderBy}
            RETURN mp.nameDisplayAs, mp.partyName, voteCount 
            LIMIT ${limit}`;
        } else {
            cypher = `MATCH (mp:Mp)-[]-(d:Division)        
            WHERE d.Date > datetime(${fromDateValue}) 
            AND d.Date < datetime(${toDateValue}) 
            WITH mp, COUNT(*) AS voteCount
            ORDER BY voteCount ${orderBy}
            RETURN mp.nameDisplayAs, mp.partyName, voteCount 
            LIMIT ${limit}`;
        }
    }

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }
}

export const mostOrLeastVotedDivision = async (ayeOrNo: string, voteCategory: string, limit: number = 40, orderBy: string = "DESCENDING", fromDate: string = EARLIEST_FROM_DATE, toDate: string) => {

    let cypher;

    //set to date to today if not provided 
    if (!toDate) {
        toDate = new Date().toISOString().substr(0, 10);
    }

    const fromDateValue = objectToStringWithoutQuotes({ year: Number(fromDate.split("-")[0]), month: Number(fromDate.split("-")[1]), day: Number(fromDate.split("-")[2]) });
    const toDateValue = objectToStringWithoutQuotes({ year: Number(toDate.split("-")[0]), month: Number(toDate.split("-")[1]), day: Number(toDate.split("-")[2]) });

    if (ayeOrNo) {

        let ayeOrNoBool = ayeOrNo === "aye" ? true : false;

        if (voteCategory) {
            cypher = `MATCH (d:Division)-[r:VOTED_FOR]-(mps:Mp)
            WHERE r.votedAye = ${ayeOrNoBool}
            AND d.Date > datetime(${fromDateValue}) 
            AND d.Date < datetime(${toDateValue}) 
            AND d.Category = "${voteCategory}"
            WITH d, COUNT(*) AS edgeCount
            ORDER BY edgeCount ${orderBy}
            RETURN d.Title, edgeCount 
            LIMIT ${limit}`;
        } else {
            cypher = `MATCH (d:Division)-[r:VOTED_FOR]-(mps:Mp)
            WHERE r.votedAye = ${ayeOrNoBool}
            AND d.Date > datetime(${fromDateValue}) 
            AND d.Date < datetime(${toDateValue}) 
            WITH d, COUNT(*) AS edgeCount
            ORDER BY edgeCount ${orderBy}
            RETURN d.Title, edgeCount 
            LIMIT ${limit}`;
        }
    } else {
        if (voteCategory) {
            cypher = `MATCH (d:Division)-[r:VOTED_FOR]-(mps:Mp)        
            WHERE d.Category = "${voteCategory}"
            AND d.Date > datetime(${fromDateValue}) 
            AND d.Date < datetime(${toDateValue}) 
            WITH d, COUNT(*) AS edgeCount
            ORDER BY edgeCount ${orderBy}
            RETURN d.Title, edgeCount 
            LIMIT ${limit}`;
        } else {
            cypher = `MATCH (d:Division)-[r:VOTED_FOR]-(mps:Mp)        
            WHERE d.Date > datetime(${fromDateValue}) 
            AND d.Date < datetime(${toDateValue}) 
            WITH d, COUNT(*) AS edgeCount
            ORDER BY edgeCount ${orderBy}
            RETURN d.Title, edgeCount 
            LIMIT ${limit}`;
        }
    }


    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }
}

export const setupDataScience = async () => {

    CONNECTION_STRING = `bolt://${process.env.NEO_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;

    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        await runCypher(`CALL gds.graph.drop('g1',false) YIELD graphName`, session);
        await runCypher(`CALL gds.graph.project('g1', ['Mp', 'Division'], ['VOTED_FOR'],  { relationshipProperties: ['votedAyeNumeric'] })`, session);
    } catch (error) {
        //contraint already exists so proceed
    }

    session.close();

}

export const cleanUp = () => {
    driver.close();
}

export const createMpNode = async (mp: Mp) => {

    const cypher: string =
        `CREATE (mp:Mp {
        id: ${mp.id},
        nameListAs: "${mp.nameListAs}",
        nameDisplayAs: "${mp.nameDisplayAs}",
        nameFullTitle: "${mp.nameFullTitle}",
        nameAddressAs: "${mp.nameAddressAs}",        
        partyId: "${mp.latestParty.id}",
        partyName: "${mp.latestParty.name}",
        gender: "${mp.gender}",
        partyAbbreviation: "${mp.latestParty.abbreviation}",
        partyBackgroundColour: "${mp.latestParty.backgroundColour}",
        partyForegroundColour: "${mp.latestParty.foregroundColour}",
        partyIsLordsMainParty: "W${mp.latestParty.isLordsMainParty}",
        partyIsLordsSpiritualParty: "${mp.latestParty.isLordsSpiritualParty}",
        partyGovernmentType: "${mp.latestParty.governmentType}",
        partyIsIndependentParty: "${mp.latestParty.isIndependentParty}",
        house: ${mp.latestHouseMembership.house},
        membershipFrom: "${mp.latestHouseMembership.membershipFrom}",        
        membershipStartDate: "${mp.latestHouseMembership.membershipStartDate}"
      });`

    try {
        const session = driver.session();
        const result = await session.run(cypher);
        // logger.debug('created ', result);

    } catch (error: any) {
        if (error.code !== "Neo.ClientError.Schema.ConstraintValidationFailed") {
            logger.debug('Error adding Club: ', error);
        }
    }

}

export const createDivisionNode = async (division: Division) => {

    const cypher: string = `CREATE (division:Division {
        DivisionId: ${division.DivisionId},
        Date: "${division.Date}",
        PublicationUpdated: "${division.PublicationUpdated}",
        Number: ${division.Number},
        IsDeferred: ${division.IsDeferred},
        EVELType: "${division.EVELType}",
        EVELCountry: "${division.EVELCountry}",
        Title: "${division.Title}",
        AyeCount: ${division.AyeCount},
        NoCount: ${division.NoCount}
        })`;

    try {
        const session = driver.session();
        const result = await session.run(cypher);

    } catch (error: any) {
        if (error.code !== "Neo.ClientError.Schema.ConstraintValidationFailed") {
            logger.debug('Error adding Club: ', error);
        }
    }

}

export const createVotedForDivision = async (votedFor: VotedFor) => {

    const cypher: string = `MATCH (mp:Mp {id: ${votedFor.mpId}}), (division:Division {DivisionId: ${votedFor.divisionId}}) CREATE (mp)-[:VOTED_FOR {votedAye: ${votedFor.votedAye}, votedAyeNumeric: ${Number(votedFor.votedAye)} }]->(division);`;

    try {
        const session = driver.session();
        // logger.debug(cypher);            
        const result = await session.run(cypher);

    } catch (error: any) {
        if (error.code !== "Neo.ClientError.Schema.ConstraintValidationFailed") {
            logger.debug('Error adding Club: ', error);
        }
    }

}