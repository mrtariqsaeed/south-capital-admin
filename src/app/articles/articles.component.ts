import { Component, OnInit, ViewChild, Inject } from '@angular/core'
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { Observable, Subscription } from 'rxjs'
import { ArticlesService } from '../../services/articles.service'
import { Article } from '../../models/articleInterface'
import { Category } from '../../models/categoryInterface'
import { CategoriesService } from '../../services/categories.service'

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

  constructor(
    public articlesService: ArticlesService,
    public dialog: MatDialog,
    public categoriesService: CategoriesService
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
    let _article = {parentID: article.parentID, title: article.title} as Article
    this.articlesService.addArticle(_article).then(() => {
      // alert("Success!")
    }, err => {
      // alert("Something went wrong!")
    })
  }

  addModalFN(): void {
    const dialogRef = this.dialog.open(AddArticleDialog, {
      width: '400px',
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
}
