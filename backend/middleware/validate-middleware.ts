import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiError } from '../utils/api-error';

export const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const extractedErrors: any[] = [];
        errors.array().map(err => extractedErrors.push({ [err.type === 'field' ? err.path : 'error']: err.msg }));
        
        throw new ApiError(422, "Validation Failed", extractedErrors);
    }
    next();
};
