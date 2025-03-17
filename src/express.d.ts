import { Request } from 'express';

declare module 'express-serve-static-core' {
    interface Request {
        user_id?: string;
        request?: any;
        user_code?: string;
        device?: {
            browser?: string;
            os?: string;
            device?: string;
        }
    }
}