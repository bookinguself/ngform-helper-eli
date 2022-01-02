/**
 *  * Copyright 2021 Eray-YL
 */
import { TestBed } from '@angular/core/testing';

import { FormHelperLibService } from './form-helper-lib.service';

describe('FormHelperLibService', () => {
  let service: FormHelperLibService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormHelperLibService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
