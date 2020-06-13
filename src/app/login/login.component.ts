import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth'
import { auth } from 'firebase/app'
import { Router } from '@angular/router'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string
  password: string

  
  constructor(public afAuth: AngularFireAuth, public router: Router) { }

  ngOnInit() {
  }

  login() {
    this.afAuth.auth.signInWithEmailAndPassword(this.email, this.password).then(() => {
      this.router.navigate(['/home'])
    })
  }

  

}
