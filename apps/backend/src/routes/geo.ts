import { readFileSync } from "node:fs";
import {prisma} from "../app";

import { fileURLToPath } from 'url';
import path from 'path';
import { util } from "better-auth";
import { count } from "node:console";

import utilityJson from "../util/utility_companies.json"

// Returns absolute path of the file
const __filename = fileURLToPath(import.meta.url);

// Returns absolute path of the folder
const __dirname = path.dirname(__filename);

type UtilResult = {
    message: string;
    result?: any[]
};

export default async function loadCounties() {

    const counties = await prisma.county.findMany();
    console.log("Counties in database:", counties);
    
    if(counties.length === 0) {
        const countyData = readFileSync("./src/util/fl-counties.txt", "utf-8").split("\n").map(line => line.trim()).filter(line => line.length > 0);
        console.log(countyData)
        prisma.county.createMany({
            data: countyData.map(countyName => ({ name: countyName }))
        }).then(() => {
            console.log("Counties loaded successfully.");
        }).catch((error) => {
            console.error("Error loading counties:", error);
        });
    }

    const utilities = await prisma.utility.findMany();
    console.log("Utilities in database:", utilities);

    if(counties.length > 0 && utilities.length === 0) {
        counties.forEach(async (county) => {
            const utilityData = await fetch(`https://pscweb.floridapsc.com/api/ConsumerAssistance/GetUtilitiesByCounty/${county.name};1`)
            const data:UtilResult = await utilityData.json() as UtilResult;
            
            
            if(data.result && data.result.length > 0) {
                console.log(`Loading utilities for county: ${county.name}`);
                const utilitiesToCreate = data.result.map(utility => ({
                    name: utility.utilityName.trim(),
                    // countyId: county.id
                }));

                const filteredUtils = utilitiesToCreate.filter((utility) => utilityJson.utilities.includes(utility.name))

                console.log(`Utilities to create for county ${county.name}:`, filteredUtils);

                await prisma.utility.createMany({
                    data: filteredUtils,
                    skipDuplicates: true
                });

                const existingUtilities = await prisma.utility.findMany({
                    where: {
                        name: {
                            in: filteredUtils.map(utility => utility.name)
                        }
                    }
                });

                prisma.countyUtility.createMany({
                    data: existingUtilities.map(utility => ({
                        countyId: county.id,
                        utilityId: utility.id // Assuming utility name is unique and can be used as an ID
                    })),
                    skipDuplicates: true
                }).then(() => {
                    console.log(`Utilities for county ${county.name} loaded successfully.`);
                }).catch((error) => {
                    console.error(`Error loading utilities for county ${county.name}:`, error);
                });
            }
        })
    }
}