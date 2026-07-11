import { readFileSync } from "node:fs";
import {prisma} from "../app";

export default async function loadCounties() {
    const counties = await prisma.county.findMany();

    if(counties.length === 0) {
        const countyData = readFileSync("../lib/fl-counties.txt", "utf-8");
        console.log(countyData)
    }
}