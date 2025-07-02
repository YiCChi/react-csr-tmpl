import { IncomingHttpHeaders } from 'node:http';

export interface Context {
  req: {
    headers: IncomingHttpHeaders;
    ip?: string;
  };
}

export interface AuthedContext extends Context {
  idToken: string;
  user: {
    id: string;
    email: string;
  };
}
