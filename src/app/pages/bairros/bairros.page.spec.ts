import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BairrosPage } from './bairros.page';

describe('BairrosPage', () => {
  let component: BairrosPage;
  let fixture: ComponentFixture<BairrosPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BairrosPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BairrosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
