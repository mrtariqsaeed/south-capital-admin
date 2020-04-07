import { Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs'
import { AngularFireStorage } from '@angular/fire/storage'
import { tap, finalize, take } from 'rxjs/operators'
import { Slide } from '../../models/slideInterface'
import { Offer } from '../../models/offerInterface'
import { OffersService } from '../../services/offers.service'
import { SlideshowService } from '../../services/slideshow.service'

@Component({
  selector: 'app-slideshow',
  templateUrl: './slideshow.component.html',
  styleUrls: ['./slideshow.component.css']
})
export class SlideshowComponent implements OnInit {
  slides$: Observable<Slide[]>
  uploadPercent: Observable<number>
  url: Observable<string>
  parent: Offer
  offers: Offer[]
  offers$: Observable<Offer[]>
  order: number = 1
  upload: boolean = false

  constructor(
    public slideshowService: SlideshowService,
    public storage: AngularFireStorage,
    public offersService: OffersService
  ) {
    this.offers$ = this.offersService.getAllOffers()
    this.offers$.pipe(take(1)).subscribe((data: Offer[]) => {
      this.offers = data
    })
  }

  ngOnInit() {
    

    if(this.parent && this.parent.id) 
    this.slides$ = this.slideshowService.getSlidesPerOffer(this.parent.id)    
  }

  uploadFile(event) {
    const file = event.target.files[0]
    const filePath = `slides\/img${new Date().getTime()}.jpg`
    const fileRef = this.storage.ref(filePath)
    const task = this.storage.upload(filePath, file)

    // observe percentage changes
    this.uploadPercent = task.percentageChanges()
    task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().pipe(take(1)).subscribe((url: string) => {
          if(url) {
            let image = {order: this.order, offerID: this.parent.id, url: url, alt: this.parent.title, href: '/offers/' + this.parent.id} as Slide
            this.slideshowService.addSlide(image)
          }
        })
      })
    ).subscribe()
  }

  offerSelected(event) {
    this.upload = true
    this.slides$ = this.slideshowService.getSlidesPerOffer(event.value.id)
  }

  deleteSlide(slide: Slide) {
    this.slideshowService.deleteSlide(slide)
  }

}
