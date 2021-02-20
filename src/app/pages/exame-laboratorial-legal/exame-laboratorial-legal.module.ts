import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { IonicSelectableModule } from 'ionic-selectable';


import { ExameLaboratorialLegalPage } from './exame-laboratorial-legal.page';

const routes: Routes = [
  {
    path: '',
    component: ExameLaboratorialLegalPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    NgxDatatableModule,
    IonicSelectableModule
  ],
  declarations: [ExameLaboratorialLegalPage]
})
export class ExameLaboratorialLegalPageModule {}
