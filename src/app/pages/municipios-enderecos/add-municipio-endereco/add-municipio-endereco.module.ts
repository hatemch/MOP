import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AddMunicipioEnderecoPage } from './add-municipio-endereco.page';

const routes: Routes = [
  {
    path: '',
    component: AddMunicipioEnderecoPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AddMunicipioEnderecoPage]
})
export class AddMunicipioEnderecoPageModule {}
