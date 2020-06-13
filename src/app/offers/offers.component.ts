import { Component, OnInit, ViewChild, Inject } from '@angular/core'
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { Offer } from '../../models/offerInterface'
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { ChangeEvent } from '@ckeditor/ckeditor5-angular'
import { AngularFireStorage } from '@angular/fire/storage'
import { take, finalize } from 'rxjs/operators'
import { OffersService } from '../../services/offers.service'
import { Observable, Subscription } from 'rxjs'
import { SlideshowService } from '../../services/slideshow.service'
import { Slide } from 'src/models/slideInterface'

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.css']
})
export class OffersComponent implements OnInit {
  offers$: Observable<Offer[]>

  displayedColumns: string[] = ['id', 'title', 'action']
  dataSource: MatTableDataSource<any>
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator
  @ViewChild(MatSort, {static: true}) sort: MatSort

  sub1: Subscription

  uploadPercent: Observable<number>
  url: Observable<string>

  constructor(
    public offersService: OffersService,
    public dialog: MatDialog,
    public storage: AngularFireStorage,
    private slideshowService: SlideshowService
  ) {
    this.sub1 = new Subscription
    this.sub1 = this.offersService.getAllOffers().subscribe((data: Offer[]) => {
      this.dataSource = new MatTableDataSource(data)
      this.dataSource.paginator = this.paginator
      this.dataSource.sort = this.sort
    })
  }

  ngOnInit() {
  }

  addOffer(offer: Offer) {
    const file = offer.image
    const filePath = `offers\/img${new Date().getTime()}.jpg`
    const fileRef = this.storage.ref(filePath)
    const task = this.storage.upload(filePath, file)

    // observe percentage changes
    this.uploadPercent = task.percentageChanges()
    task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().pipe(take(1)).subscribe((url: string) => {
          if(url) {
            offer.image = url
            this.offersService.addOffer(offer).then(() => {
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
    const dialogRef = this.dialog.open(AddOfferDialog, {
      width: '600px'
    })

    dialogRef.afterClosed().subscribe((res: Offer) => {
      if(res){
        this.addOffer(res)
      }
    })
  }

  deleteModal(offer: Offer) {
    const modal = this.dialog.open(DeleteOfferDialog, {
      width: '400px',
      data: offer
    })

    modal.afterClosed().subscribe((res: Offer) => {
      if(res) {
        this.offersService.deleteOffer(res).then(() => {
          this.slideshowService.getSlidesPerOffer(res.id).pipe(take(1)).subscribe((slides: Slide[]) => {
            slides.forEach((slide: Slide) => {
              this.slideshowService.deleteSlide(slide)
            })
          })
        })
      }
    })
  }

  editModal(offer: Offer) {
    const img = offer.image
    const modal = this.dialog.open(EditOfferDialog, {
      width: '400px',
      data: offer
    })

    modal.afterClosed().subscribe((res: Offer) => {
      console.log(img)
      if(res) {
        if(res.image == img) {
          this.updateOffer(res)
        }else {
          this.updateImage(res, img)
        }
        
      }
    })
  }

  updateOffer(offer: Offer) {
    this.offersService.updateOffer(offer).then(() => {
      // alert('Successfully Updated!')
    })
  }

  updateImage(offer: Offer, oldImage: string) {
    this.storage.storage.refFromURL(oldImage).delete().then(() => {
      const file = offer.image
      const filePath = `offers\/img${new Date().getTime()}.jpg`
      const fileRef = this.storage.ref(filePath)
      const task = this.storage.upload(filePath, file)
  
      // observe percentage changes
      // this.uploadPercent = task.percentageChanges()
      task.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().pipe(take(1)).subscribe((url: string) => {
            if(url) {
              offer.image = url
              this.offersService.updateOffer(offer).then(() => {
                alert('Successfully Updated!')
              }, err => console.log(err))
            }
          })
        })
      ).subscribe()
    }, errr => console.log(errr))
  }

  viewModal(offer: Offer) {
    this.dialog.open(ViewOfferDialog, {
      width: '600px',
      data: offer
    })
  }


}


// ================================
//       View Offer Dialog
// ================================
@Component({
  selector: 'view-offer-dialog',
  templateUrl: 'view-offer-dialog.html',
  styleUrls: ['./offers.component.css']
})
export class ViewOfferDialog {
  constructor(
    public dialogRef: MatDialogRef<ViewOfferDialog>,
    @Inject(MAT_DIALOG_DATA) public offer
  ) {}

  cancel() {
    this.dialogRef.close()
  }

}


// ================================
//       Add Offer Dialog
// ================================
@Component({
  selector: 'add-offer-dialog',
  templateUrl: 'add-offer-dialog.html',
  styleUrls: ['./offers.component.css']
})
export class AddOfferDialog {
  editor = ClassicEditor
  offer = {} as Offer
  err = ''

  constructor(
    public dialogRef: MatDialogRef<AddOfferDialog>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

  save(): void {
    if(!this.offer.title || !this.offer.text) {
      this.err = `
      برجاء ادخال كافه البيانات
      `
    }else {
      this.dialogRef.close(this.offer)
    }
  }

  cancel() {
    this.dialogRef.close()
  }

  onChange( { editor }: ChangeEvent ) {
    this.offer.text = editor.getData()
  }

  fileSelected(event) {
    this.offer.image = event.target.files[0]
  }

}

// ================================
//       Delete Offer Dialog
// ================================
@Component({
  selector: 'delete-offer-dialog',
  templateUrl: 'delete-offer-dialog.html',
  styleUrls: ['./offers.component.css']
})
export class DeleteOfferDialog {
  constructor(
    public dialogRef: MatDialogRef<DeleteOfferDialog>,
    @Inject(MAT_DIALOG_DATA) public data
  ){}

  delete(offer) {
    if(offer.id && offer.id !== '') {
      this.dialogRef.close(offer)
    }
  }
  cancel() {
    this.dialogRef.close()
  }
}


// ================================
//       Edit Offer Dialog
// ================================
@Component({
  selector: 'edit-offer-dialog',
  templateUrl: 'edit-offer-dialog.html',
  styleUrls: ['./offers.component.css']
})

export class EditOfferDialog {
  editor = ClassicEditor
  err = ''
  thumb: string

  constructor(
    public dialogRef: MatDialogRef<EditOfferDialog>,
    @Inject(MAT_DIALOG_DATA) public offer
  ) {
    this.thumb = this.offer.image
  }

  cancel() {
    this.dialogRef.close()
  }
  
  save() {
    if(this.offer.title !== '' && this.offer.text !== '')
    {
      this.dialogRef.close(this.offer)
    }else {
      this.err = `
      برجاء ادخال كافه البيانات
      `
    }
  }

  onChange( { editor }: ChangeEvent ) {
    this.offer.text = editor.getData()
  }

  fileSelected(event) {
    this.offer.image = event.target.files[0]
  }
}
