import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroAdmDevicesPage } from './cadastro-adm-devices.page';

describe('CadastroAdmDevicesPage', () => {
  let component: CadastroAdmDevicesPage;
  let fixture: ComponentFixture<CadastroAdmDevicesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CadastroAdmDevicesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CadastroAdmDevicesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
