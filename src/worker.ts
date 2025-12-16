import { handleRoutes } from './routes/index';

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    return handleRoutes(request, env);
  },
};