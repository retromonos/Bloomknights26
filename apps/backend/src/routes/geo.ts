import { readFileSync } from "node:fs";
import {prisma} from "../app";

import { fileURLToPath } from 'url';
import path from 'path';

// Returns absolute path of the file
const __filename = fileURLToPath(import.meta.url);

// Returns absolute path of the folder
const __dirname = path.dirname(__filename);

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
}