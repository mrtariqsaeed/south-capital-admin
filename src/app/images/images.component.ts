import { Component, OnInit } from '@angular/core';
import { ImagesService } from '../../services/images.service'
import { Image } from '../../models/imageInterface'
import { Observable } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/storage'
import { tap, finalize, take } from 'rxjs/operators';
import { CategoriesService } from '../../services/categories.service';
import { Category } from '../../models/categoryInterface';

@Component({
  selector: 'app-images',
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.css']
})
export class ImagesComponent implements OnInit {
  images$: Observable<Image[]>
  uploadPercent: Observable<number>;
  url: Observable<string>
  parent: Category
  categories: Category[]
  categories$: Observable<Category[]>

  constructor(
    public imagesService: ImagesService,
    public storage: AngularFireStorage,
    public categoriesService: CategoriesService
  ) {
    this.categories$ = this.categoriesService.allCategoriesFN()
    this.categories$.pipe(take(1)).subscribe((data: Category[]) => {
      this.categories = data;
    })
  }

  ngOnInit() {
    if(this.categories)
    this.parent = this.categories[0]

    if(this.parent && this.parent.id) 
    this.images$ = this.imagesService.allImagesFN(this.parent.id)
    
  }

  uploadFile(event) {
    const file = event.target.files[0];
    const filePath = `images\/img${new Date().getTime()}.jpg`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);

    // observe percentage changes
    this.uploadPercent = task.percentageChanges();
    task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().pipe(take(1)).subscribe((url: string) => {
          if(url) {
            let image = {parentID: this.parent.id, image: url, alt: this.parent.name}
            this.imagesService.addImage(image)
          }
        })
      })
    ).subscribe()
  }

  categorySelected(event) {
    this.images$ = this.imagesService.allImagesFN(event.value.id)
  }

  deleteImage(img: Image) {
    this.imagesService.deleteImage(img)
  }

}
