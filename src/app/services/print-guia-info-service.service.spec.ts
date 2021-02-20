import { TestBed } from '@angular/core/testing';

import { PrintGuiaInfoServiceService } from './print-guia-info-service.service';

describe('PrintGuiaInfoServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PrintGuiaInfoServiceService = TestBed.get(PrintGuiaInfoServiceService);
    expect(service).toBeTruthy();
  });
});
