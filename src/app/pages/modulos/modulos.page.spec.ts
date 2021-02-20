import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModulosPage } from './modulos.page';

describe('ModulosPage', () => {
  let component: ModulosPage;
  let fixture: ComponentFixture<ModulosPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModulosPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModulosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
