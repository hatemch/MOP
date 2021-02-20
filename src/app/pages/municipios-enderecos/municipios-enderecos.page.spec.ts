import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MunicipiosEnderecosPage } from './municipios-enderecos.page';

describe('MunicipiosEnderecosPage', () => {
  let component: MunicipiosEnderecosPage;
  let fixture: ComponentFixture<MunicipiosEnderecosPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MunicipiosEnderecosPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MunicipiosEnderecosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
