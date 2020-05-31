import { Component, OnInit, ViewChild, Inject } from '@angular/core'
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { Service } from '../../models/serviceInterface'
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ChangeEvent } from '@ckeditor/ckeditor5-angular'
import { AngularFireStorage } from '@angular/fire/storage'
import { take, finalize } from 'rxjs/operators'
import { ServicesService } from '../../services/services.service'
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-service',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent implements OnInit {
  services$: Observable<Service[]>

  displayedColumns: string[] = ['id', 'title', 'action']
  dataSource: MatTableDataSource<any>
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator
  @ViewChild(MatSort, {static: true}) sort: MatSort

  sub1: Subscription

  uploadPercent: Observable<number>;
  url: Observable<string>

  constructor(
    public servicesService: ServicesService,
    public dialog: MatDialog,
    public storage: AngularFireStorage
  ) {
    this.sub1 = new Subscription
    this.sub1 = this.servicesService.getAllServices().subscribe((data: Service[]) => {
      this.dataSource = new MatTableDataSource(data)
      this.dataSource.paginator = this.paginator
      this.dataSource.sort = this.sort
    })
  }

  ngOnInit() {
  }

  addService(service: Service) {
    const file = service.image;
    const filePath = `services\/img${new Date().getTime()}.jpg`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);

    // observe percentage changes
    this.uploadPercent = task.percentageChanges();
    task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().pipe(take(1)).subscribe((url: string) => {
          if(url) {
            service.image = url
            this.servicesService.addService(service).then(() => {
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
    const dialogRef = this.dialog.open(AddServiceDialog, {
      width: '600px'
    })

    dialogRef.afterClosed().subscribe((res: Service) => {
      if(res){
        this.addService(res)
      }
    })
  }

  deleteModal(service: Service) {
    const modal = this.dialog.open(DeleteServiceDialog, {
      width: '400px',
      data: service
    })

    modal.afterClosed().subscribe((res: Service) => {
      if(res) {
        this.servicesService.deleteService(res).then(() => {
          // alert('Deleted Successfully!')
        })
      }
    })
  }

  editModal(service: Service) {
    const img = service.image
    const modal = this.dialog.open(EditServiceDialog, {
      width: '400px',
      data: service
    })

    modal.afterClosed().subscribe((res: Service) => {
      console.log(img)
      if(res) {
        if(res.image == img) {
          this.updateService(res)
        }else {
          this.updateImage(res, img)
        }
        
      }
    })
  }

  updateService(service: Service) {
    this.servicesService.updateService(service).then(() => {
      // alert('Successfully Updated!')
    })
  }

  updateImage(service: Service, oldImage: string) {
    this.storage.storage.refFromURL(oldImage).delete().then(() => {
      const file = service.image;
      const filePath = `images\/img${new Date().getTime()}.jpg`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, file);
  
      // observe percentage changes
      // this.uploadPercent = task.percentageChanges();
      task.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().pipe(take(1)).subscribe((url: string) => {
            if(url) {
              service.image = url
              this.servicesService.updateService(service).then(() => {
                alert('Successfully Updated!')
              }, err => console.log(err))
            }
          })
        })
      ).subscribe()
    }, errr => console.log(errr))
  }

  viewModal(service: Service) {
    this.dialog.open(ViewServiceDialog, {
      width: '600px',
      data: service
    })
  }


}


// ================================
//       View Service Dialog
// ================================
@Component({
  selector: 'view-service-dialog',
  templateUrl: 'view-service-dialog.html',
  styleUrls: ['./services.component.css']
})
export class ViewServiceDialog {
  constructor(
    public dialogRef: MatDialogRef<ViewServiceDialog>,
    @Inject(MAT_DIALOG_DATA) public service
  ) {}

  cancel() {
    this.dialogRef.close()
  }

}


// ================================
//       Add Service Dialog
// ================================
@Component({
  selector: 'add-service-dialog',
  templateUrl: 'add-service-dialog.html',
  styleUrls: ['./services.component.css']
})
export class AddServiceDialog {
  editor = ClassicEditor
  service = {} as Service
  err = ''

  constructor(
    public dialogRef: MatDialogRef<AddServiceDialog>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

  save(): void {
    if(!this.service.title || !this.service.text) {
      this.err = `
      برجاء ادخال كافه البيانات
      `
    }else {
      this.dialogRef.close(this.service)
    }
  }

  cancel() {
    this.dialogRef.close()
  }

  onChange( { editor }: ChangeEvent ) {
    this.service.text = editor.getData();
  }

  fileSelected(event) {
    this.service.image = event.target.files[0]
  }

}

// ================================
//       Delete Service Dialog
// ================================
@Component({
  selector: 'delete-service-dialog',
  templateUrl: 'delete-service-dialog.html',
  styleUrls: ['./services.component.css']
})
export class DeleteServiceDialog {
  constructor(
    public dialogRef: MatDialogRef<DeleteServiceDialog>,
    @Inject(MAT_DIALOG_DATA) public data
  ){}

  delete(service) {
    if(service.id && service.id !== '') {
      this.dialogRef.close(service)
    }
  }
  cancel() {
    this.dialogRef.close()
  }
}


// ================================
//       Edit Service Dialog
// ================================
@Component({
  selector: 'edit-service-dialog',
  templateUrl: 'edit-service-dialog.html',
  styleUrls: ['./services.component.css']
})

export class EditServiceDialog {
  thumb: string
  err = ''
  constructor(
    public dialogRef: MatDialogRef<EditServiceDialog>,
    @Inject(MAT_DIALOG_DATA) public service
  ) {
    this.thumb = this.service.image
  }

  cancel() {
    this.dialogRef.close()
  }
  
  save() {
    if(this.service.title !== '' && this.service.text !== '')
    {
      this.dialogRef.close(this.service)
    }else {
      this.err = `
      برجاء ادخال كافه البيانات
      `
    }
  }

  fileSelected(event) {
    this.service.image = event.target.files[0]
  }
}
