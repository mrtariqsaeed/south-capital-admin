import { Injectable } from '@angular/core'
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore'
import { Category } from '../models/categoryInterface'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})

export class CategoriesService {
  categoriesRef: AngularFirestoreCollection<Category>
  categories$: Observable<Category[]>
  categoriesArr: Category[]

  constructor(private afs: AngularFirestore) {
    this.categoriesRef = this.afs.collection<Category>('categories', ref => ref.orderBy('order', 'asc'))
    this.categories$ = this.categoriesRef.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as Category
          const id = a.payload.doc.id
          return { id, ...data }
        })
      })
    )
    this.categories$.subscribe((data: Category[]) => {
      this.categoriesArr = data
    })
  }

  allCategoriesFN(): Observable<Category[]> {
    return this.categories$
  }

  addCategory(category: Category) {
    return this.afs.collection('categories').add(category)
  }

  updateCategory(category: Category) {
    const id = category.id
    delete category.id
    return this.afs.doc('categories/' + id).update(category)
  }

  deleteCategory(id: string) {
    return this.afs.doc('categories/' + id).delete()
  }
}
