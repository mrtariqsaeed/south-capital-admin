import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore'
import { Service } from '../models/serviceInterface'
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/storage'

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  servicesRef: AngularFirestoreCollection<Service>
  services$: Observable<Service[]>

  constructor(public afs: AngularFirestore, public afstorage: AngularFireStorage) {
    this.servicesRef = this.afs.collection('services')
    this.services$ = this.servicesRef.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as Service
          const id = a.payload.doc.id
          return { id, ...data }
        })
      })
    )
  }

  getAllServices() {
    return this.services$
  }

  addService(service: Service) {
    return this.afs.collection('services').add(service)
  }

  updateService(service: Service) {
    let id = service.id
    delete service.id
    return this.afs.doc('services/' + id).update(service)
  }

  deleteService(service: Service) {
    if(service.image)
      this.afstorage.storage.refFromURL(service.image).delete()

    return this.afs.doc('services/' + service.id).delete()
  }
}
