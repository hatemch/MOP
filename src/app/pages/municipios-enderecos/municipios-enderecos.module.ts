import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { MunicipiosEnderecosPage } from './municipios-enderecos.page';

const routes: Routes = [
  {
    path: '',
    component: MunicipiosEnderecosPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [MunicipiosEnderecosPage]
})
export class MunicipiosEnderecosPageModule {}
