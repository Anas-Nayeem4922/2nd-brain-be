import { Request } from "express";

export interface CustomRequest<T = string> extends Request {
    userId?: T;
}