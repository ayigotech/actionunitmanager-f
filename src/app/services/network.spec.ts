import { TestBed } from '@angular/core/testing';

import { NetworkService } from './network';

describe('Network', () => {
  let service: NetworkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NetworkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
