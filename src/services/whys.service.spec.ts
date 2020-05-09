import { TestBed } from '@angular/core/testing';

import { WhysService } from './whys.service';

describe('WhysService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WhysService = TestBed.get(WhysService);
    expect(service).toBeTruthy();
  });
});
