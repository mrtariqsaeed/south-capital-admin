import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { OopsComponent } from './oops/oops.component';
import { ArticlesComponent } from './articles/articles.component'
import { ImagesComponent } from './images/images.component'
const routes: Routes = [
  {path: 'home', component: HomeComponent},
  {path: 'articles', component: ArticlesComponent},
  {path: 'images', component: ImagesComponent},
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: '**', component: OopsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
