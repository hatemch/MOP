import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicSelectableModule } from 'ionic-selectable';
import { IonicModule } from '@ionic/angular';

import { ConsultasgeoPage } from './consultasgeo.page';

import { File } from '@ionic-native/file/ngx';
const routes: Routes = [
  {
    path: '',
    component: ConsultasgeoPage
  }
];

@NgModule({
  imports: [
    IonicSelectableModule,
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ConsultasgeoPage],
  providers: [
    File
  ]
})
export class ConsultasgeoPageModule {}
