
import { Request, Response } from 'express';
import { sendSuccess } from '@/utils/response';
import { workCategories } from '@/config/workCategories';

export class MetaController {
  getWorkCategories(req: Request, res: Response) {
    sendSuccess(res, workCategories, 'Work categories retrieved successfully');
  }
}