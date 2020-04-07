import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore'
import { Offer } from '../models/offerInterface'
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/storage'

@Injectable({
  providedIn: 'root'
})
export class OffersService {
  offersRef: AngularFirestoreCollection<Offer>
  offers$: Observable<Offer[]>

  constructor(public afs: AngularFirestore, public afstorage: AngularFireStorage) {
    this.offersRef = this.afs.collection('offers')
    this.offers$ = this.offersRef.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as Offer
          const id = a.payload.doc.id
          return { id, ...data }
        })
      })
    )
  }

  getAllOffers() {
    return this.offers$
  }

  addOffer(offer: Offer) {
    return this.afs.collection('offers').add(offer)
  }

  updateOffer(offer: Offer) {
    let id = offer.id
    delete offer.id
    return this.afs.doc('offers/' + id).update({title: offer.title, brief: offer.brief, text: offer.text})
  }

  deleteOffer(offer: Offer) {
    if(offer.image)
      this.afstorage.storage.refFromURL(offer.image).delete()

    return this.afs.doc('offers/' + offer.id).delete()
  }
}
