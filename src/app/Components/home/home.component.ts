import { Component, OnInit, OnDestroy } from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Chatroom} from '../../modals/modal';
import { AuthServices } from 'src/app/service/CommenService';
import { Observable, Subscription, fromEvent } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy  {

  constructor(private Route: Router, private route: ActivatedRoute,  public service: AuthServices,
              public tostr: ToastrService) { }
  userImage = false;
  pic: any;
  name: string;
  chat = new Chatroom();
  Room: string;
  params: string;
  onlineEvent: Observable<Event>;
  offlineEvent: Observable<Event>;
  subscriptions: Subscription[] = [];
  connectionStatusMessage: string;
  connectionStatus: string;
  
  ngOnInit() {
    this.getOwnerroom();

    this.onlineEvent = fromEvent(window, 'online');
    this.offlineEvent = fromEvent(window, 'offline');

    this.subscriptions.push(this.onlineEvent.subscribe(e => {
      this.connectionStatusMessage = 'Back to online';
      this.connectionStatus = 'online';
      this.tostr.success('Back to online');
    }));

    this.subscriptions.push(this.offlineEvent.subscribe(e => {
      this.connectionStatusMessage = 'Connection lost! You are not connected to internet';
      this.connectionStatus = 'offline';
      this.tostr.warning('May be you lost connectivity');
    }));

  }

 public Changelayout() {
  this.route.paramMap.subscribe(params => {
    // tslint:disable-next-line: no-string-literal
    this.params = params['params'].roomname;
    const data = JSON.parse(localStorage.getItem('currentUser'));
    if (data != null ) {
          this.userImage = true;
          this.pic = data.photoUrl;
          this.name = data.name;
          if (this.params === this.Room) {
            this.Route.navigate(['/meeting']);
       }
    }
    });
  }

  public getOwnerroom() {
    const user =  JSON.parse(localStorage.getItem('currentUser'));
    if (user != null) {
      this.service.GetownerRoom(user.email).subscribe(Response => {
        // tslint:disable-next-line: no-string-literal
        if (Response['Email'] != null) {
          // tslint:disable-next-line: no-string-literal
          this.Room = Response['Roomname'];
        }
        this.Changelayout();
      });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

}
