import {auth, prisma} from "../app";

import type { Request, Response } from "express";
import type { OnboardRequest, ScheduleRequest } from "@bloomknights/types"

export async function handleOnboardRequest(req: Request, res: Response) {
    try {
        const body = req.body as OnboardRequest;

        const session = await auth.api.getSession({
            headers: req.headers as any
        });

        if(!session) {
            res.status(401).json({ message: "Unauthorized" });
            return
        }

        const currentUser = await prisma.user.findUnique({
            where: {
                id: session.user.id
            }
        });

        if(!currentUser) {
            res.status(404).json({ message: "User not found" });
            return
        }

        const county = await prisma.county.findFirst({
            where: {
                name: body.county
            }
        });

        if(!county) {
            res.status(404).json({ message: "County not found" });
            return
        }

        const utility = await prisma.utility.findFirst({
            where: {
                name: body.utilityCompany
            }
        });

        if(!utility) {
            res.status(404).json({ message: "Utility company not found" });
            return
        }

        await prisma.countyInstance.create({
            data: {
                userId: currentUser.id,
                countyId: county.id
            }
        })

        await prisma.utilityInstance.create({
            data: {
                userId: currentUser.id,
                utilityId: utility.id
            }
        })

        res.status(200).json({ message: "Onboarding successful" });
    } catch (err: any) {
        res.status(err.status || 500).json({ message: "An error occurred", error: err.message });
    }
}

export async function GetUtilitiesByCounty(req: Request, res: Response) {
    try {
        const session = await auth.api.getSession({
            headers: req.headers as any
        });

        if(!session) {
            res.status(401).json({ message: "Unauthorized" });
            return
        }

        const body = req.body as {county: string}

        const county = await prisma.county.findFirst({
            where: {
                name: body.county
            }
        })

        if(!county) {
            res.status(404).json({message: "County not found"})
            return
        }

        console.log("body:", body.county)
        console.log("county:", county.name)

        const utilitiesA = await prisma.countyUtility.findMany({
            where: {
                county: county
            }
        })

        const list = []

        for(let i = 0; i < utilitiesA.length; i++) {
            const u = utilitiesA.at(i)
            if(!u) continue

            list.push(await prisma.utility.findUnique({
                where: {
                    id: u.utilityId
                }
            }))
        }

        res.status(200).json({utilities: list})
    } catch (err: any) {
        res.status(err.status || 500).json({ message: "An error occurred", error: err.message });
    }
}