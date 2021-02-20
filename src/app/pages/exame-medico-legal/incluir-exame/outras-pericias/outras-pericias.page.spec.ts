import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutrasPericiasPage } from './outras-pericias.page';

describe('OutrasPericiasPage', () => {
  let component: OutrasPericiasPage;
  let fixture: ComponentFixture<OutrasPericiasPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutrasPericiasPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutrasPericiasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
