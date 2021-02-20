import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrocosenhaPage } from './trocosenha.page';

describe('TrocosenhaPage', () => {
  let component: TrocosenhaPage;
  let fixture: ComponentFixture<TrocosenhaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrocosenhaPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrocosenhaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
