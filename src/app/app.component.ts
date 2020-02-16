import { Component } from '@angular/core';
import { CategoriesService } from '../services/categories.service';
import { AngularFireAuth } from '@angular/fire/auth'
import { Router } from '@angular/router'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'dashboard';
  constructor(
    public categoriesService: CategoriesService, 
    public afAuth: AngularFireAuth,
    public router: Router
  ){}

  logout() {
    this.afAuth.auth.signOut().then(() => {
      this.router.navigate(['/login'])
    })
  }
}
