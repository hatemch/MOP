import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmDevicesPage } from './adm-devices.page';

describe('AdmDevicesPage', () => {
  let component: AdmDevicesPage;
  let fixture: ComponentFixture<AdmDevicesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdmDevicesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdmDevicesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
