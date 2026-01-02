export interface Env {
  R2_BUCKET: R2Bucket;
  MEDIA_TOKEN_SECRET: string;
  API_INTERNAL_URL: string;
  API_INTERNAL_KEY: string;
  ENVIRONMENT: string;
}

export interface MediaTokenPayload {
  sub: string; // userId
  res: string; // resourceId (fileId, 'avatar', 'cover')
  typ: 'file' | 'preview' | 'avatar' | 'cover';
  pid?: string; // packId (for pack files)
  fn?: string; // filename (for Content-Disposition)
  ct?: string; // contentType
  exp: number; // expiration timestamp
  iat: number; // issued at
}

export interface ResolvePathResponse {
  path: string;
  contentType: string;
  filename?: string;
}
