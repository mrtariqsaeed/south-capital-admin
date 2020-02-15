import { Component } from '@angular/core';
import { CategoriesService } from '../services/categories.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'dashboard';
  constructor(public categoriesService: CategoriesService){}
}
