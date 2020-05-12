// import { Component, OnInit,Input } from '@angular/core';
import { Component, OnInit,ViewChild } from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  animations: [
    trigger('visibility', [
        state('shown', style({
            transform: 'scale(1.0)',
            opacity: 1
        })),
        state('hidden', style({
            transform: 'scale(0.5)',
            opacity: 0
        })),
        transition('* => *', animate('0.5s ease-in-out'))
    ])
  ]
})
export class DishdetailComponent implements OnInit {
  @ViewChild('fform') feedbackFormDirective;
 // @Input()
  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  now = new Date();
  dishErrMess:string;
  dishcopy: Dish;
  visibility = 'shown';

  formErrors = {
    'author': '',
    'comment': '',
  };

  validationMessages = {
    'author': {
      'required':      'Name is required.',
      'minlength':     'Name must be at least 2 characters long.',
    },
    'comment': {
      'required':      'Comment is required.',
    },
  };

  CommentForm: FormGroup;

  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,private fb: FormBuilder) { this.createForm();}

  ngOnInit() {
    this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params.pipe(switchMap((params: Params) => { this.visibility = 'hidden'; return this.dishservice.getDish(+params['id']); }))
    .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); this.visibility = 'shown'; },
      errmess => this.dishErrMess = <any>errmess);
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }


  createForm() {
    this.CommentForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2)] ],
      rating:5,
      comment: ['', [Validators.required] ],
      date :this.now.toISOString(),
    });
    this.CommentForm.valueChanges.subscribe(data => this.onValueChanged(data));
    this.onValueChanged(); // (re)set validation messages now
  }

  onValueChanged(data?: any) {
    if (!this.CommentForm) { return; }
    const form = this.CommentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }


  onSubmit() {
    this.dish.comments.push(this.CommentForm.value);
    //console.log(this.feedback);
    this.dishservice.putDish(this.dish)
    .subscribe(dish => {this.dish = dish;},
    errmess => { this.dish = null; this.dishcopy = null; this.dishErrMess = <any>errmess; });



    this.CommentForm.reset({
      author: '',
      rating:5,
      comment: '',
      date :this.now.toISOString(),
    });
    this.feedbackFormDirective.resetForm({
      author: '',
      rating:5,
      comment: '',
      date :this.now.toISOString(),
    });;
  }

}
