import { TestBed } from '@angular/core/testing';

import { FeatureGuard } from './feature-guard';

describe('FeatureGuard', () => {
  let service: FeatureGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeatureGuard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
