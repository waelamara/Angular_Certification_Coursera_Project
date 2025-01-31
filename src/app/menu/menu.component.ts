import { Component, OnInit ,Inject} from '@angular/core';
import { Dish } from '../shared/dish';
import { flyInOut,expand } from '../animations/app.animation';

import{DishService} from '../services/dish.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
    },
  animations: [
    flyInOut(),
    expand()
  ]
})
export class MenuComponent implements OnInit {
  
  constructor(private dishService:DishService) { }
  errMess: string;
  dishes:Dish[];
 
   ngOnInit() {
    this.dishService.getDishes().subscribe(dishes => this.dishes = dishes,
    errmess => this.errMess = <any>errmess);

  }

}
