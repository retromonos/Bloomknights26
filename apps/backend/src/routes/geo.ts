import { readFileSync } from "node:fs";
import {auth, prisma} from "../app";

import type { Request, Response } from "express";
import type { OnboardRequest, ScheduleRequest } from "@bloomknights/types"
import "dotenv/config";

import { fileURLToPath } from 'url';
import path from 'path';

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

                const filteredUtils = utilitiesToCreate.filter((utility) => utilityJson.utilities.find((v)=>v.name === utility.name))

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

    const utilityRates = await prisma.utilityRate.findMany()

    if(utilityRates.length === 0) {
        utilityJson.utilities.forEach((u) => {
            u.rates.forEach(async (r) => {

                const utility = await prisma.utility.findFirst({
                    where: {
                        name: u.name
                    }
                })

                if(!utility) return
                
                await prisma.utilityRate.create({
                    data: {
                        utilityId: utility?.id,
                        startTime: r.start,
                        endTime: r.end,
                        name: r.name,
                        rate: r.rate
                    }
                })

            })
        })
    }

    return
}

export async function requestCountyFromZip(req: Request, res: Response) {
    try {
        console.log(req.headers)

        const session = await auth.api.getSession({
            headers: req.headers as any
        });

        if(!session) {
            res.status(401).json({ message: "Unauthorized" });
            return
        }

        const body = req.body as { zipCode: string };
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${body.zipCode}&sensor=true&key=${process.env.GOOGLE_MAPS_API_KEY ?? ""}`);
        const data:any = await response.json();

        if(data.status !== "OK" || !data.results || data.results.length === 0) {
            res.status(404).json({ message: "County not found" });
            return
        }

        const countyComponent = data.results[0].address_components.find((component: any) => component.types.includes("administrative_area_level_2"));

        if(!countyComponent) {
            res.status(404).json({ message: "County not found" });
            return
        }

        res.json({ county: countyComponent.long_name.replace(" County", "") });
    } catch (err: any) {
        res.status(err.status || 500).json({ message: "An error occurred", error: err.message });
    }
}