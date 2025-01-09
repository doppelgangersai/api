import { Injectable } from '@nestjs/common';

@Injectable()
export class FilterService {
  // mock for filter: on input - array of strings, on output - array of strings
  bulkFilter(input: string[]): Promise<string[]> {
    return Promise.resolve(input); // mock
  }
}
