import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGrupoPage } from './add-grupo.page';

describe('AddGrupoPage', () => {
  let component: AddGrupoPage;
  let fixture: ComponentFixture<AddGrupoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddGrupoPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddGrupoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
