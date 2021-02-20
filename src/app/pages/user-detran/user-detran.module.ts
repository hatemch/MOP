import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { NgxDatatableModule } from "@swimlane/ngx-datatable";

import { IonicModule } from '@ionic/angular';

import { UserDetranPage } from './user-detran.page';

const routes: Routes = [
  {
    path: '',
    component: UserDetranPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgxDatatableModule,
    RouterModule.forChild(routes)
  ],
  declarations: [UserDetranPage]
})
export class UserDetranPageModule {}
