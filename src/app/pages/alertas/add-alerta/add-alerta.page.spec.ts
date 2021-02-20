import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAlertaPage } from './add-alerta.page';

describe('AddAlertaPage', () => {
  let component: AddAlertaPage;
  let fixture: ComponentFixture<AddAlertaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddAlertaPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAlertaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
