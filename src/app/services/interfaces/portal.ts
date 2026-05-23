import { Request, Response } from 'express';
import { RowRecord } from './misc/record';

export interface Portal {
  id: string;
  name: string;
  country: string;
  status: 'activo' | 'inactivo';
}

export type IPortal = RowRecord<Portal>;

export interface PortalService<TResponse> {
  list(req: Request, res: Response): Promise<TResponse>;
}