import { Injectable } from '@angular/core';
import { Slide } from '../models/slideInterface'
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { AngularFireStorage } from '@angular/fire/storage'

@Injectable({
  providedIn: 'root'
})
export class SlideshowService {
  slidesRef: AngularFirestoreCollection<Slide>
  slides$: Observable<Slide[]>

  constructor(private afs: AngularFirestore, private afstorage: AngularFireStorage) {}

  getSlidesPerOffer(offerID: string): Observable<Slide[]> {
    this.slidesRef = this.afs.collection<Slide>('slides', ref => ref.where('offerID', '==', offerID))
    this.slides$ = this.slidesRef.snapshotChanges().pipe(
      map(rows => {
        return rows.map(row => {
          const data = row.payload.doc.data() as Slide
          const id = row.payload.doc.id
          return {id, ...data}
        })
      })
    )

    return this.slides$
  }

  addSlide(slide: Slide) {
    return this.afs.collection('slides').add(slide)
  }

  deleteSlide(slide: Slide) {
    this.afstorage.storage.refFromURL(slide.url).delete()
    return this.afs.doc('slides/' + slide.id).delete()
  }
}
