import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore'
import  { Content } from '../models/contentInterface'
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ContentsService {
  contentRef: AngularFirestoreCollection<Content>
  contents$: Observable<Content[]>
  
  constructor(
    private afs: AngularFirestore
  ) {
    
  }

  getContentByArticle(parentID: string) {
    this.contentRef = this.afs.collection<Content>('contents', ref => {
      return ref.where('parentID', '==', parentID)
      .orderBy('order', 'asc')
    })

    this.contents$ = this.contentRef.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Content
        const id = a.payload.doc.id
        return {id, ...data} as Content
      }))
    )

    return this.contents$
  }

  addContent(content: Content) {
    return this.afs.collection('contents').add(content)
  }

  deleteContent(id: string) {
    return this.afs.doc('contents/' + id).delete()
  }
}
