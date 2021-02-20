import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicSelectableModule } from 'ionic-selectable';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { IonicModule } from '@ionic/angular';

import { PericiandosPage } from './periciandos.page';

const routes: Routes = [
  {
    path: '',
    component: PericiandosPage
  }
];

@NgModule({
  imports: [IonicSelectableModule,
    NgxDatatableModule,
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [PericiandosPage]
})
export class PericiandosPageModule {}
