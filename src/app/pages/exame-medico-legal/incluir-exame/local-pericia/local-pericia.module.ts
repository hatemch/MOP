import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { LocalPericiaPage } from './local-pericia.page';
import { IonicSelectableModule } from 'ionic-selectable';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

const routes: Routes = [
  {
    path: '',
    component: LocalPericiaPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicSelectableModule,
    NgxDatatableModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [LocalPericiaPage]
})
export class LocalPericiaPageModule {}
