import { Component, OnInit, Inject } from '@angular/core'
import { Router, ActivatedRoute, ParamMap } from '@angular/router'
import { ArticlesService } from '../../services/articles.service'
import { ContentsService } from '../../services/contents.service'
import { switchMap, finalize, take } from 'rxjs/operators'
import { of, Observable } from 'rxjs'
import { Article } from '../../models/articleInterface'
import { Content } from '../../models/contentInterface'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ChangeEvent } from '@ckeditor/ckeditor5-angular'
import { AngularFireStorage } from '@angular/fire/storage'

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit {
  article: Article
  articleID: string
  contents$ : Observable<Content[]>
  uploadPercent: Observable<number>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private articlesService: ArticlesService,
    private contentsService: ContentsService,
    private dialog: MatDialog,
    private storage: AngularFireStorage
  ) {
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => of(params.get('id')))
    ).subscribe((id: string) => {
      this.articleID = id;
      this.articlesService.getArticleByID(id).then(doc => {
        if(doc) this.article = doc.data() as Article
      })

      this.contents$ = this.contentsService.getContentByArticle(id)
    })
  }

  addContentModal() {
    let ref = this.dialog.open(AddContentDialog, {
      width: '600px',
      data: this.articleID
    })

    ref.afterClosed().subscribe((res: Content) => {
      if(res) {
        if(res.image && res.image != '') {
          this.addContent(res)
        } else {
          this.contentsService.addContent(res).then().catch(err => console.log(err))
        }
      }
    })
  }

  addContent(content: Content) {
    const file = content.image
    const filePath = `articles\/img${Date.now()}.jpg`
    const fileRef = this.storage.ref(filePath)
    const task = this.storage.upload(filePath, file)
    
    task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().pipe(take(1)).subscribe((url: string) => {
          if(url) {
            console.log(url)
            content.image = url
            this.contentsService.addContent(content).then(() => console.log('success'), err => console.log(err)).catch(err => console.log(err))
          }
        })
      })
    ).subscribe()
  }

  deleteContentModal(content: Content) {
    const ref = this.dialog.open(DeleteContentDialog, {
      width: '400px',
      data: content.id
    })

    ref.afterClosed().subscribe((res: string) => {
      if(res) {
        if(content.image && content.image != '') {
          this.deleteImage(content)
        }else {
          this.contentsService.deleteContent(content.id)
        }
      }
    })
  }

  deleteImage(content: Content) {
    this.storage.storage.refFromURL(content.image).delete().then(() => {
      this.contentsService.deleteContent(content.id)
    })
  }

  ngOnInit() {}

  goArticles() {
    this.router.navigate(['/articles'])
  }

}

/*========================================
          Add Content Dialog
========================================*/
@Component({
  selector: 'add-content-dialog',
  templateUrl: './add-content-dialog.html',
  styleUrls: ['./content.component.css']
})
export class AddContentDialog {
  content = {order: 1} as Content
  editor = ClassicEditor

  constructor(
    public dialogRef: MatDialogRef<AddContentDialog>,
    @Inject(MAT_DIALOG_DATA) public parentID: string
  ){}

  save() {
    if(this.content.text || this.content.image)
      this.content.parentID = this.parentID
      this.dialogRef.close(this.content)
  }

  cancel() {
    this.content = undefined
    this.dialogRef.close()
  }

  onChange( { editor }: ChangeEvent ) {
    this.content.text = editor.getData();
  }

  fileSelected(event) {
    this.content.image = event.target.files[0]
  }
}


/*========================================
          Delete Content Dialog
========================================*/
@Component({
  selector: 'delete-content-dialog',
  templateUrl: './delete-content-dialog.html',
  styleUrls: ['./content.component.css']
})
export class DeleteContentDialog {
  constructor(
    private dialogRef: MatDialogRef<DeleteContentDialog>,
    @Inject(MAT_DIALOG_DATA) public id: string
  ){}

  delete() {
    this.dialogRef.close(this.id)
  }

  cancel() {
    this.dialogRef.close()
  }
}
