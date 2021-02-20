import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalPericiaPage } from './local-pericia.page';

describe('LocalPericiaPage', () => {
  let component: LocalPericiaPage;
  let fixture: ComponentFixture<LocalPericiaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocalPericiaPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocalPericiaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
