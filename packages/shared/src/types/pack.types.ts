export type PackStatus = 'draft' | 'published' | 'unpublished' | 'deleted';

export interface Pack {
  id: string;
  creatorId: string;
  title: string;
  description: string | null;
  price: number;
  status: PackStatus;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  deletedAt: Date | null;
}

export interface PackFile {
  id: string;
  packId: string;
  filename: string;
  mimeType: string;
  size: number;
  storageKey: string;
  order: number;
}

export interface PackPreview {
  id: string;
  packId: string;
  url: string;
  order: number;
}
