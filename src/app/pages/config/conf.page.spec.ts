import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { confPage } from './conf.page';

describe('confPage', () => {
  let component: confPage;
  let fixture: ComponentFixture<confPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ confPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(confPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
