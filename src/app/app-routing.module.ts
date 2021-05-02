import { RouterModule, Routes } from '@angular/router';

import { FreeGridComponent } from './components/free-grid/free-grid.component';
import { NgModule } from '@angular/core';
import { TwoThreeComponent } from './components/two-three/two-three.component';

const routes: Routes = [
  { path: '', component: FreeGridComponent },
  { path: 'two-three', component: TwoThreeComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }