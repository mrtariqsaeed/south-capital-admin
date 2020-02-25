import { Injectable } from '@angular/core'
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Image } from '../models/imageInterface'
import { AngularFireStorage } from '@angular/fire/storage'

@Injectable({
  providedIn: 'root'
})
export class ImagesService {
  imagesRef: AngularFirestoreCollection<Image>
  images$: Observable<Image[]>
  imagesArr: Image[]

  constructor(private afs: AngularFirestore, private afStorage: AngularFireStorage) {}

  allImagesFN(parentID: string): Observable<Image[]> {
    this.imagesRef = this.afs.collection<Image>('images', ref => ref.where('parentID', '==', parentID))
    this.images$ = this.imagesRef.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as Image
          const id = a.payload.doc.id
          return { id, ...data }
        })
      })
    )
    return this.images$
  }

  addImage(image: Image) {
    return this.afs.collection('images').add(image)
  }

  deleteImage(img: Image) {
    this.afs.doc('images/' + img.id).delete().then (() => {
      return this.afStorage.storage.refFromURL(img.image).delete()
    })
  }
}
