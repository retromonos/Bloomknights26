import {auth, prisma} from "../app";

import type { Request, Response } from "express";
import type { OnboardRequest, ScheduleRequest } from "@bloomknights/types"

export async function handleOnboardRequest(req: Request, res: Response) {
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

    await prisma.user.update({
        where: {
            id: currentUser.id
        },
        data: {
            countyId: county.id,
            utilityId: utility.id
        }
    });

    res.status(200).json({ message: "Onboarding successful" });
}