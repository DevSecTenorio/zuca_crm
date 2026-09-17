import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      service: 'crm-seuzuca-api',
      timestamp: new Date().toISOString(),
    };
  }
}
