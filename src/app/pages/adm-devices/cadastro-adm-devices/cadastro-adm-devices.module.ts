import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicSelectableModule } from 'ionic-selectable';
import { IonicModule } from '@ionic/angular';

import { CadastroAdmDevicesPage } from './cadastro-adm-devices.page';

const routes: Routes = [
  {
    path: '',
    component: CadastroAdmDevicesPage
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
  declarations: [CadastroAdmDevicesPage]
})
export class CadastroAdmDevicesPageModule {}
