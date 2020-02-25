import { Component, OnInit, ViewChild, Inject } from '@angular/core'
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { Observable, Subscription } from 'rxjs'
import { ArticlesService } from '../../services/articles.service'
import { Article } from '../../models/articleInterface'
import { Category } from '../../models/categoryInterface'
import { CategoriesService } from '../../services/categories.service'
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ChangeEvent } from '@ckeditor/ckeditor5-angular'
import { AngularFireStorage } from '@angular/fire/storage'
import { take, finalize } from 'rxjs/operators'

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css']
})
export class ArticlesComponent implements OnInit {
  articles: Article[]
  categories: Category[]
  displayedColumns: string[] = ['id', 'title', 'parent', 'action']
  dataSource: MatTableDataSource<any>
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator
  @ViewChild(MatSort, {static: true}) sort: MatSort
  sub1: Subscription = new Subscription()

  uploadPercent: Observable<number>;
  url: Observable<string>


  constructor(
    public articlesService: ArticlesService,
    public dialog: MatDialog,
    public categoriesService: CategoriesService,
    private storage: AngularFireStorage
  ) {
    this.sub1 = new Subscription()
    this.sub1 = this.articlesService.allArticlesFN().subscribe((data: Article[]) => {
      this.categories = this.categoriesService.categoriesArr
      this.articles = data
      this.articlesService.articlesArr = data
      this.dataSource = new MatTableDataSource(this.articles)
      this.dataSource.paginator = this.paginator
      this.dataSource.sort = this.sort
    })
  }
  ngOnInit() {}

  returnParent(id): string {
    if(this.categories) {
      let parent = this.categories.find(x => x.id == id)
      if(parent) {
        return parent.name
      } else {
        return '__'
      }
    }
  }


  addArticleFN(article: Article) {
    const file = article.image;
    const filePath = `articles\/img${new Date().getTime()}.jpg`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);

    // observe percentage changes
    this.uploadPercent = task.percentageChanges();
    task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().pipe(take(1)).subscribe((url: string) => {
          if(url) {
            article.image = url
            this.articlesService.addArticle(article).then(() => {
              // alert("Success!")
            }, err => {
              // alert("Something went wrong!")
            })
          }
        })
      })
    ).subscribe()

    
  }

  addModalFN(): void {
    const dialogRef = this.dialog.open(AddArticleDialog, {
      width: '600px',
      data: this.categories
    })

    dialogRef.afterClosed().subscribe((res: Article) => {
      if(res){
        this.addArticleFN(res)
      }
    })
  }

  deleteModalFN(article: Article) {
    const modal = this.dialog.open(DeleteArticleDialog, {
      width: '400px',
      data: article
    })

    modal.afterClosed().subscribe((res: string) => {
      if(res) {
        this.articlesService.deleteArticle(res).then(() => {
          // alert('Deleted Successfully!')
        })
      }
    })
  }

  editModalFN(article: Article) {
    const modal = this.dialog.open(EditArticleDialog, {
      width: '400px',
      data: article
    })

    modal.afterClosed().subscribe((res: Category) => {
      if(res) {
        this.articlesService.updateArticle(article).then(() => {
          // alert('Successfully Updated!')
        })
      }
    })
  }

  viewModalFN(article: Article) {
    this.dialog.open(ViewArticleDialog, {
      width: '400px',
      data: article
    })
  }

}

// ================================
//       View Article Dialog
// ================================
@Component({
  selector: 'view-article-dialog',
  templateUrl: 'view-article-dialog.html',
  styleUrls: ['./articles.component.css']
})
export class ViewArticleDialog {
  constructor(
    public dialogRef: MatDialogRef<ViewArticleDialog>,
    @Inject(MAT_DIALOG_DATA) public article
  ) {}

  cancelFN() {
    this.dialogRef.close()
  }

}


// ================================
//       Add Article Dialog
// ================================
@Component({
  selector: 'add-article-dialog',
  templateUrl: 'add-article-dialog.html',
  styleUrls: ['./articles.component.css']
})
export class AddArticleDialog {
  editor = ClassicEditor
  article = {parentID: ''} as Article
  err = ''

  constructor(
    public dialogRef: MatDialogRef<AddArticleDialog>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

  saveFN(): void {
    if(!this.article.title || !this.article.text) {
      this.err = `
      برجاء ادخال كافه البيانات
      `
    }else {
      this.dialogRef.close(this.article)
    }
  }

  cancelFN() {
    this.dialogRef.close()
  }

  onChange( { editor }: ChangeEvent ) {
    this.article.text = editor.getData();
  }

  fileSelected(event) {
    this.article.image = event.target.files[0]
  }

}

// ================================
//       Delete Article Dialog
// ================================
@Component({
  selector: 'delete-article-dialog',
  templateUrl: 'delete-article-dialog.html',
  styleUrls: ['./articles.component.css']
})
export class DeleteArticleDialog {
  constructor(
    public dialogRef: MatDialogRef<DeleteArticleDialog>,
    @Inject(MAT_DIALOG_DATA) public data
  ){}

  deleteFN(article) {
    if(article.id && article.id !== '') {
      this.dialogRef.close(article.id)
    }
  }
  cancelFN() {
    this.dialogRef.close()
  }
}


// ================================
//       Edit Article Dialog
// ================================
@Component({
  selector: 'edit-article-dialog',
  templateUrl: 'edit-article-dialog.html',
  styleUrls: ['./articles.component.css']
})

export class EditArticleDialog {
  editor = ClassicEditor
  categories: Category[]
  err = ''
  constructor(
    public dialogRef: MatDialogRef<EditArticleDialog>,
    @Inject(MAT_DIALOG_DATA) public article,
    public categoriesService: CategoriesService
  ) {
    this.categories = this.categoriesService.categoriesArr
  }

  cancelFN() {
    this.dialogRef.close()
  }
  
  saveFN() {
    if(this.article.title !== '' && this.article.text !== '')
    {
      this.dialogRef.close(this.article)
    }else {
      this.err = `
      برجاء ادخال كافه البيانات
      `
    }
  }

  onChange( { editor }: ChangeEvent ) {
    this.article.text = editor.getData();
  }
}
