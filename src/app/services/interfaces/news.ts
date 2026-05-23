import { Request, Response } from 'express';
import { RowRecord } from './misc/record';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  country: string;
  author: string;
  image_url?: string | null;
  status: 'borrador' | 'publicado';
}

export type INewsItem = RowRecord<NewsItem>;

export interface NewsService<TResponse> {
  create(req: Request, res: Response): Promise<TResponse>;
  list(req: Request, res: Response): Promise<TResponse>;
}