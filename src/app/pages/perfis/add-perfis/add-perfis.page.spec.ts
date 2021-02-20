import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPerfisPage } from './add-perfis.page';

describe('AddPerfisPage', () => {
  let component: AddPerfisPage;
  let fixture: ComponentFixture<AddPerfisPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddPerfisPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPerfisPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
