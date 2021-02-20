import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDetranPage } from './user-detran.page';
//import { NgxDatatableModule } from '@swimlane/ngx-datatable';
//import { AppComponent } from 'src/app/app.component';

describe('UserDetranPage', () => {
  let component: UserDetranPage;
  let fixture: ComponentFixture<UserDetranPage>;

  // beforeEach(async(() => {
  //   TestBed.configureTestingModule({
  //     declarations: [
  //       AppComponent],
  //     imports: [
  //       NgxDatatableModule ]
  //     })
  //   } ) );

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserDetranPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserDetranPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
