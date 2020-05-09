import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore'
import { Why } from '../models/whyInrerface'
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/storage'

@Injectable({
  providedIn: 'root'
})
export class WhysService {
  whysRef: AngularFirestoreCollection<Why>
  whys$: Observable<Why[]>

  constructor(public afs: AngularFirestore, public afstorage: AngularFireStorage) {
    this.whysRef = this.afs.collection('whys')
    this.whys$ = this.whysRef.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as Why
          const id = a.payload.doc.id
          return { id, ...data }
        })
      })
    )
  }

  getAllWhys() {
    return this.whys$
  }

  addWhy(why: Why) {
    return this.afs.collection('whys').add(why)
  }

  updateWhy(why: Why) {
    let id = why.id
    delete why.id
    return this.afs.doc('whys/' + id).update(why)
  }

  deleteWhy(why: Why) {
    if(why.image)
      this.afstorage.storage.refFromURL(why.image).delete()

    return this.afs.doc('whys/' + why.id).delete()
  }
}
