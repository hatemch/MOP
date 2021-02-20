import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutrosPage } from './outros.page';

describe('OutrosPage', () => {
  let component: OutrosPage;
  let fixture: ComponentFixture<OutrosPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutrosPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutrosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
