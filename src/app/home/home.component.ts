import { Component, OnInit, ViewChild, Inject } from '@angular/core'
import { CategoriesService } from '../../services/categories.service'
import { Subscription } from 'rxjs'
import { Category } from '../../models/categoryInterface'
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { AngularFireStorage } from '@angular/fire/storage'
import { finalize, take } from 'rxjs/operators'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  public categories: Category[]
  displayedColumns: string[] = ['id', 'name', 'parent', 'action']
  dataSource: MatTableDataSource<any>
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator
  @ViewChild(MatSort, {static: true}) sort: MatSort
  sub1: Subscription = new Subscription()

  parentID: string = ''
  name: string = ''
  event: any
  
  constructor(
    public categoriesService: CategoriesService,
    public dialog: MatDialog,
    public storage: AngularFireStorage
  ) {
    this.sub1 = new Subscription()
    this.sub1 = this.categoriesService.allCategoriesFN().subscribe((data: Category[]) => {
      this.categories = data
      this.categoriesService.categoriesArr = data
      this.dataSource = new MatTableDataSource(this.categories)
      this.dataSource.paginator = this.paginator
      this.dataSource.sort = this.sort
    })
  }

  ngOnInit() {}

  returnParent(id): string {
    let parent = this.categories.find(x => x.id == id)
    if(parent) {
      return parent.name
    } else {
      return '__'
    }
  }

  fileSelected(event: any) {
    this.event = event
  }

  addCategoryFN(category: Category) {
    if(category.name === '' || category.name === null || category.name === undefined) {
      alert("Name is required!")
    } else {
      const file = this.event.target.files[0];
      const filePath = `images\/img${new Date().getTime()}.jpg`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, file);

      // observe percentage changes
      // this.uploadPercent = task.percentageChanges();
      task.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().pipe(take(1)).subscribe((url: string) => {
            if(url) {
              category.image = url
              this.categoriesService.addCategory(category).then(() => {
                // alert("Success!")
              }, err => {
                // alert("Something went wrong!")
              })
            }
          })
        })
      ).subscribe()
      // let cat = {parentID: category.parentID, name: category.name} as Category
      
    }
  }

  addModalFN(): void {
    const dialogRef = this.dialog.open(AddCategoryDialog, {
      width: '400px',
      data: this.categories
    })

    dialogRef.afterClosed().subscribe((res: Category) => {
      if(res && res.name !== ''){
        this.addCategoryFN(res)
      }
    })
  }

  deleteModalFN(category: Category) {
    const modal = this.dialog.open(DeleteCategoryDialog, {
      width: '400px',
      data: category
    })

    modal.afterClosed().subscribe((res: string) => {
      if(res) {
        this.categoriesService.deleteCategory(res).then(() => {
          // alert('Deleted Successfully!')
        })
      }
    })
  }

  editModalFN(category: Category) {
    const modal = this.dialog.open(EditCategoryDialog, {
      width: '400px',
      data: category
    })

    modal.afterClosed().subscribe((res: Category) => {
      if(res) {
        this.categoriesService.updateCategory(category).then(() => {
          // alert('Successfully Updated!')
        })
      }
    })
  }

  ngOnDestroy() {
    this.sub1.unsubscribe()
  }

}

// ================================
//       Add Category Dialog
// ================================
@Component({
  selector: 'add-category-dialog',
  templateUrl: 'add-category-dialog.html',
  styleUrls: ['./home.component.css']
})
export class AddCategoryDialog {
  category = {parentID: '', order: 0} as Category
  err = ''

  constructor(
    public dialogRef: MatDialogRef<AddCategoryDialog>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

  saveFN(): void {
    if(this.category.name && this.category.order) {
      this.dialogRef.close(this.category)
    }else {
      this.err = `
      برجاء ادخال كافه البيانات
      `
    }
  }

  cancelFN() {
    this.dialogRef.close()
  }

}

// ================================
//       Delete Category Dialog
// ================================
@Component({
  selector: 'delete-category-dialog',
  templateUrl: 'delete-category-dialog.html',
  styleUrls: ['./home.component.css']
})
export class DeleteCategoryDialog {
  constructor(
    public dialogRef: MatDialogRef<DeleteCategoryDialog>,
    @Inject(MAT_DIALOG_DATA) public data
  ){}

  deleteFN(category) {
    if(category.id && category.id !== '') {
      this.dialogRef.close(category.id)
    }
  }
  cancelFN() {
    this.dialogRef.close()
  }
}


// ================================
//       Edit Category Dialog
// ================================
@Component({
  selector: 'edit-category-dialog',
  templateUrl: 'edit-category-dialog.html',
  styleUrls: ['./home.component.css']
})

export class EditCategoryDialog {
  categories: Category[]
  err = ''
  constructor(
    public dialogRef: MatDialogRef<EditCategoryDialog>,
    @Inject(MAT_DIALOG_DATA) public category,
    public categoriesService: CategoriesService
  ) {
    this.categories = this.categoriesService.categoriesArr
  }

  cancelFN() {
    this.dialogRef.close()
  }
  
  saveFN() {
    if(this.category.name !== '')
    {
      this.dialogRef.close(this.category)
    }else {
      this.err = `
      برجاء ادخال اسم القسم
      `
    }
  }
}