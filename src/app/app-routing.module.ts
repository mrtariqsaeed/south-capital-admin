import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { OopsComponent } from './oops/oops.component';
import { ArticlesComponent } from './articles/articles.component'
import { ImagesComponent } from './images/images.component'
import { LoginComponent } from './login/login.component'
import { AngularFireAuthGuard, redirectUnauthorizedTo, redirectLoggedInTo, canActivate } from '@angular/fire/auth-guard'
import { OffersComponent } from './offers/offers.component';
import { SlideshowComponent } from './slideshow/slideshow.component';
import { ContentComponent } from './content/content.component';

const redirectVisitor = redirectUnauthorizedTo(['login'])
const redirectUser = redirectLoggedInTo(['home'])

const routes: Routes = [
  {path: 'home', component: HomeComponent, ...canActivate(redirectVisitor)},
  {path: 'articles', component: ArticlesComponent, ...canActivate(redirectVisitor)},
  {path: 'content/:id', component: ContentComponent, ...canActivate(redirectVisitor)},
  {path: 'offers', component: OffersComponent, ...canActivate(redirectVisitor)},
  {path: 'slideshow', component: SlideshowComponent, ...canActivate(redirectVisitor)},
  {path: 'images', component: ImagesComponent, ...canActivate(redirectVisitor)},
  {path: 'login', component: LoginComponent, ...canActivate(redirectUser)},
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: '**', component: OopsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
