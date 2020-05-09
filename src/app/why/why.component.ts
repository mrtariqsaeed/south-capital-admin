import { Component, OnInit, ViewChild, Inject } from '@angular/core'
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { Why } from '../../models/whyInrerface'
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ChangeEvent } from '@ckeditor/ckeditor5-angular'
import { AngularFireStorage } from '@angular/fire/storage'
import { take, finalize } from 'rxjs/operators'
import { WhysService } from '../../services/whys.service'
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-why',
  templateUrl: './why.component.html',
  styleUrls: ['./why.component.css']
})
export class WhyComponent implements OnInit {
  whys$: Observable<Why[]>

  displayedColumns: string[] = ['id', 'title', 'action']
  dataSource: MatTableDataSource<any>
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator
  @ViewChild(MatSort, {static: true}) sort: MatSort

  sub1: Subscription

  uploadPercent: Observable<number>;
  url: Observable<string>

  constructor(
    public whysService: WhysService,
    public dialog: MatDialog,
    public storage: AngularFireStorage
  ) {
    this.sub1 = new Subscription
    this.sub1 = this.whysService.getAllWhys().subscribe((data: Why[]) => {
      this.dataSource = new MatTableDataSource(data)
      this.dataSource.paginator = this.paginator
      this.dataSource.sort = this.sort
    })
  }

  ngOnInit() {
  }

  addWhy(why: Why) {
    const file = why.image;
    const filePath = `whys\/img${new Date().getTime()}.jpg`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);

    // observe percentage changes
    this.uploadPercent = task.percentageChanges();
    task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().pipe(take(1)).subscribe((url: string) => {
          if(url) {
            why.image = url
            this.whysService.addWhy(why).then(() => {
              // alert("Success!")
            }, err => {
              // alert("Something went wrong!")
            })
          }
        })
      })
    ).subscribe()

    
  }

  addModal(): void {
    const dialogRef = this.dialog.open(AddWhyDialog, {
      width: '600px'
    })

    dialogRef.afterClosed().subscribe((res: Why) => {
      if(res){
        this.addWhy(res)
      }
    })
  }

  deleteModal(why: Why) {
    const modal = this.dialog.open(DeleteWhyDialog, {
      width: '400px',
      data: why
    })

    modal.afterClosed().subscribe((res: Why) => {
      if(res) {
        this.whysService.deleteWhy(res).then(() => {
          // alert('Deleted Successfully!')
        })
      }
    })
  }

  editModal(why: Why) {
    const img = why.image
    const modal = this.dialog.open(EditWhyDialog, {
      width: '400px',
      data: why
    })

    modal.afterClosed().subscribe((res: Why) => {
      console.log(img)
      if(res) {
        if(res.image == img) {
          this.updateWhy(res)
        }else {
          this.updateImage(res, img)
        }
        
      }
    })
  }

  updateWhy(why: Why) {
    this.whysService.updateWhy(why).then(() => {
      // alert('Successfully Updated!')
    })
  }

  updateImage(why: Why, oldImage: string) {
    this.storage.storage.refFromURL(oldImage).delete().then(() => {
      const file = why.image;
      const filePath = `images\/img${new Date().getTime()}.jpg`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, file);
  
      // observe percentage changes
      // this.uploadPercent = task.percentageChanges();
      task.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().pipe(take(1)).subscribe((url: string) => {
            if(url) {
              why.image = url
              this.whysService.updateWhy(why).then(() => {
                alert('Successfully Updated!')
              }, err => console.log(err))
            }
          })
        })
      ).subscribe()
    }, errr => console.log(errr))
  }

  viewModal(why: Why) {
    this.dialog.open(ViewWhyDialog, {
      width: '600px',
      data: why
    })
  }


}


// ================================
//       View Why Dialog
// ================================
@Component({
  selector: 'view-why-dialog',
  templateUrl: 'view-why-dialog.html',
  styleUrls: ['./why.component.css']
})
export class ViewWhyDialog {
  constructor(
    public dialogRef: MatDialogRef<ViewWhyDialog>,
    @Inject(MAT_DIALOG_DATA) public why
  ) {}

  cancel() {
    this.dialogRef.close()
  }

}


// ================================
//       Add Why Dialog
// ================================
@Component({
  selector: 'add-why-dialog',
  templateUrl: 'add-why-dialog.html',
  styleUrls: ['./why.component.css']
})
export class AddWhyDialog {
  editor = ClassicEditor
  why = {} as Why
  err = ''

  constructor(
    public dialogRef: MatDialogRef<AddWhyDialog>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

  save(): void {
    if(!this.why.title || !this.why.text) {
      this.err = `
      برجاء ادخال كافه البيانات
      `
    }else {
      this.dialogRef.close(this.why)
    }
  }

  cancel() {
    this.dialogRef.close()
  }

  onChange( { editor }: ChangeEvent ) {
    this.why.text = editor.getData();
  }

  fileSelected(event) {
    this.why.image = event.target.files[0]
  }

}

// ================================
//       Delete Why Dialog
// ================================
@Component({
  selector: 'delete-why-dialog',
  templateUrl: 'delete-why-dialog.html',
  styleUrls: ['./why.component.css']
})
export class DeleteWhyDialog {
  constructor(
    public dialogRef: MatDialogRef<DeleteWhyDialog>,
    @Inject(MAT_DIALOG_DATA) public data
  ){}

  delete(why) {
    if(why.id && why.id !== '') {
      this.dialogRef.close(why)
    }
  }
  cancel() {
    this.dialogRef.close()
  }
}


// ================================
//       Edit Why Dialog
// ================================
@Component({
  selector: 'edit-why-dialog',
  templateUrl: 'edit-why-dialog.html',
  styleUrls: ['./why.component.css']
})

export class EditWhyDialog {
  thumb: string
  err = ''
  constructor(
    public dialogRef: MatDialogRef<EditWhyDialog>,
    @Inject(MAT_DIALOG_DATA) public why
  ) {
    this.thumb = this.why.image
  }

  cancel() {
    this.dialogRef.close()
  }
  
  save() {
    if(this.why.title !== '' && this.why.text !== '')
    {
      this.dialogRef.close(this.why)
    }else {
      this.err = `
      برجاء ادخال كافه البيانات
      `
    }
  }

  fileSelected(event) {
    this.why.image = event.target.files[0]
  }
}
