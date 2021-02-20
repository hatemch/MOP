import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarPessoasPage } from './buscar-pessoas.page';

describe('BuscarPessoasPage', () => {
  let component: BuscarPessoasPage;
  let fixture: ComponentFixture<BuscarPessoasPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuscarPessoasPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuscarPessoasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
