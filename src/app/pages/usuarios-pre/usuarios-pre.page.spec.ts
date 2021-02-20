import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuariosPrePage } from './usuarios-pre.page';

describe('UsuariosPrePage', () => {
  let component: UsuariosPrePage;
  let fixture: ComponentFixture<UsuariosPrePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsuariosPrePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsuariosPrePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
