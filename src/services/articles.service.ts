import { Injectable } from '@angular/core'
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore'
import { Article } from '../models/articleInterface'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})

export class ArticlesService {
  articlesRef: AngularFirestoreCollection<Article>
  articles$: Observable<Article[]>
  articlesArr: Article[]

  constructor(private afs: AngularFirestore) {
    this.articlesRef = this.afs.collection<Article>('articles')
    this.articles$ = this.articlesRef.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as Article
          const id = a.payload.doc.id
          return { id, ...data }
        })
      })
    )
  }

  allArticlesFN(): Observable<Article[]> {
    return this.articles$
  }

  getArticleByID(id: string) {
    return this.afs.doc('articles/' + id).ref.get()
  }

  addArticle(article: Article) {
    return this.afs.collection('articles').add(article)
  }

  updateArticle(article: Article) {
    const id = article.id
    delete article.id
    return this.afs.doc('articles/' + id).update({parentID: article.parentID, title: article.title, brief: article.brief, text: article.text})
  }

  deleteArticle(id: string) {
    return this.afs.doc('articles/' + id).delete()
  }
}
