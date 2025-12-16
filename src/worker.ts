import { handleRoutes } from './routes/index';
import { renderLanding } from './landing';

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    if (request.method === 'GET') {
      return renderLanding();
    }
    return handleRoutes(request, env);
  },
};