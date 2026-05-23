import { Request, Response } from 'express';
import { RowRecord } from './misc/record';

export interface Testimonial {
  id: string;
  name: string;
  photo_url: string;
  text: string;
  country: string;
  instagram_url?: string | null;
  facebook_url?: string | null;
  publication_status: 'borrador' | 'publicado' | 'despublicado';
}

export type ITestimonial = RowRecord<Testimonial>;

export interface TestimonialService<TResponse> {
  create(req: Request, res: Response): Promise<TResponse>;
  list(req: Request, res: Response): Promise<TResponse>;
}