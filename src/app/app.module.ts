import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../material/material.module';
import { FormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireAuthGuardModule } from '@angular/fire/auth-guard';
import { environment } from '../environments/environment';
import { HomeComponent, AddCategoryDialog, DeleteCategoryDialog, EditCategoryDialog } from './home/home.component';
import { OopsComponent } from './oops/oops.component';
import { CategoriesService } from '../services/categories.service';
import { ArticlesComponent, AddArticleDialog, DeleteArticleDialog, EditArticleDialog, ViewArticleDialog } from './articles/articles.component';
import { ImagesComponent } from './images/images.component';
import { LoginComponent } from './login/login.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { SlideshowComponent } from './slideshow/slideshow.component';
import { OffersComponent, AddOfferDialog, EditOfferDialog, DeleteOfferDialog, ViewOfferDialog } from './offers/offers.component';
import { ServicesComponent, AddServiceDialog, EditServiceDialog, DeleteServiceDialog, ViewServiceDialog } from './services/services.component';
import { ContentComponent, AddContentDialog, DeleteContentDialog } from './content/content.component';
import { WhyComponent, AddWhyDialog, ViewWhyDialog, EditWhyDialog, DeleteWhyDialog } from './why/why.component';

@NgModule({
  declarations: [
    AppComponent,
    OopsComponent,
    ImagesComponent,
    LoginComponent,
    SlideshowComponent,
    HomeComponent, AddCategoryDialog, DeleteCategoryDialog, EditCategoryDialog, 
    ArticlesComponent, AddArticleDialog, DeleteArticleDialog, EditArticleDialog, ViewArticleDialog,
    OffersComponent, AddOfferDialog, EditOfferDialog, DeleteOfferDialog, ViewOfferDialog,
    ServicesComponent, AddServiceDialog, EditServiceDialog, DeleteServiceDialog, ViewServiceDialog,
    ContentComponent, AddContentDialog, DeleteContentDialog,
    WhyComponent, AddWhyDialog, ViewWhyDialog, EditWhyDialog, DeleteWhyDialog
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    MaterialModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireAuthModule,
    AngularFireAuthGuardModule,
    CKEditorModule
  ],
  entryComponents: [
    HomeComponent, AddCategoryDialog, DeleteCategoryDialog, EditCategoryDialog, 
    ArticlesComponent, AddArticleDialog, DeleteArticleDialog, EditArticleDialog, ViewArticleDialog,
    OffersComponent, AddOfferDialog, EditOfferDialog, DeleteOfferDialog, ViewOfferDialog,
    ServicesComponent, AddServiceDialog, EditServiceDialog, DeleteServiceDialog, ViewServiceDialog,
    ContentComponent, AddContentDialog, DeleteContentDialog,
    WhyComponent, AddWhyDialog, ViewWhyDialog, EditWhyDialog, DeleteWhyDialog
  ],
  providers: [
    CategoriesService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
