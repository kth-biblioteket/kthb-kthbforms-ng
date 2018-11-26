import { TestBed } from '@angular/core/testing';

import { OpenurlService } from './openurl.service';

describe('OpenurlService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OpenurlService = TestBed.get(OpenurlService);
    expect(service).toBeTruthy();
  });
});
