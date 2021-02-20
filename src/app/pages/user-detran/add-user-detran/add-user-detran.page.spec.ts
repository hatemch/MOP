import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUserDetranPage } from './add-user-detran.page';

describe('AddUserDetranPage', () => {
  let component: AddUserDetranPage;
  let fixture: ComponentFixture<AddUserDetranPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddUserDetranPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUserDetranPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
