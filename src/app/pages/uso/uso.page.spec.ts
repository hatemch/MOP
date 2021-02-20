import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsoPage } from './uso.page';

describe('UsoPage', () => {
  let component: UsoPage;
  let fixture: ComponentFixture<UsoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsoPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
