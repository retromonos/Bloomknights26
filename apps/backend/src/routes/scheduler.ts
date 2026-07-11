import type { Request, Response } from "express";
import type { ScheduleRequest } from "@bloomknights/types"

export function handleSchedulerRequest(req: Request, res: Response) {
    const body = req.body as ScheduleRequest;

    
}   