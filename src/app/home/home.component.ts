import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { User } from '../_models';
import { UserService } from '../_services';
import { AuthenticationService } from '../_services';

@Component({templateUrl: 'home.component.html'})
export class HomeComponent implements OnInit {
    users: User[] = [];
    user: any;

    constructor(private userService: UserService, private authServ: AuthenticationService ) {}

    ngOnInit() {
        // console.log(this.authServ.getUser());
        this.user = this.authServ.getUser();
        this.userService.getAll().pipe(first()).subscribe(users => { 
            this.users = users;
            // console.log(this.users); 
        });
    }
}