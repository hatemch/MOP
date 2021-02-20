import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PericiandosPage } from './periciandos.page';

describe('PericiandosPage', () => {
  let component: PericiandosPage;
  let fixture: ComponentFixture<PericiandosPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PericiandosPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PericiandosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
