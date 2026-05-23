import { Request, Response } from 'express';
import { RowRecord } from './misc/record';

export interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  purpose: string;
  country: string;
  status: 'pendiente' | 'gestionada' | 'respondida';
}

export type IContactRequest = RowRecord<ContactRequest>;

export interface ContactRequestService<TResponse> {
  create(req: Request, res: Response): Promise<TResponse>;
  list(req: Request, res: Response): Promise<TResponse>;
  detail(req: Request, res: Response): Promise<TResponse>;
}