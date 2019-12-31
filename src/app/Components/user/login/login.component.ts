import {Component, OnInit} from '@angular/core';
import {AuthService} from 'angularx-social-login';
import {GoogleLoginProvider, SocialUser} from 'angularx-social-login';
import {Router} from '@angular/router';
import {AuthServices} from '../../../service/CommenService';
import {User} from '../../../modals/modal';
import {ToastrService} from 'ngx-toastr';
import {auth} from 'firebase/app';
import {AngularFireAuth} from '@angular/fire/auth';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({selector: 'app-login', templateUrl: './login.component.html', styleUrls: ['./login.component.scss']})
export class LoginComponent implements OnInit {
  WithEmail = true;
  verification = true;
  // tslint:disable-next-line: max-line-length
  constructor(public authService: AuthService, public route: Router, public service: AuthServices, public toastr: ToastrService, public afAuth: AngularFireAuth,
              public spinner: NgxSpinnerService) {}
  loginuser: any;
  userImage = false;
  disablebutton = true;
  User = new User();
  usr: SocialUser;
  ngOnInit() {
    this.authService.authState.subscribe(user => {
      this.usr = user;
    });
  }

  async signInWithGoogle() {
    this.spinner.show();
    await this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider()).then(x => {
      this.service.login(x.user, 'GoogleSignin').subscribe(Response => {
        this.spinner.hide();
        setTimeout(() => {
          this.GoogleCallback(Response);
        }, 2000);
      });
    }).catch(e => {
      this.spinner.hide();
    });
    // );
    //   await this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then(x =>
    //    this.service.login(x, 'GoogleSignin').subscribe(Response => {
    //       tslint:disable-next-line: no-string-literal
    //      if (Response['user'] !== 'user already register') {
    //       setTimeout(() => {
    //         this.route.navigate(['/']);
    //       }, 2000);
    //      }
    //    })
    //  );
  }

  public GoogleCallback(response) {
    // tslint:disable-next-line: no-string-literal
    if (response['user'] !== 'user already register') {
      setTimeout(() => {
       this.route.navigate(['/']);
      }, 2000);
     }
  }

  public UsePhone() {
    this.WithEmail = false;
  }

  public UseEmail() {
    this.WithEmail = true;
  }

  public Login(value) {
    this.User.email = value;
    if (value === '') {
      return false;
    }

    // tslint:disable-next-line: max-line-length
    const regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    const serchfind = regexp.test(this.User.email);
    if (!serchfind) {
      this.toastr.warning('Email not valid', 'Warning');
    } else {
      this.spinner.show();
      this.service.login(this.User, 'Loginuser').subscribe(Response => {
        this.spinner.hide();
        // tslint:disable-next-line: no-string-literal
        if (Response['user'].indexOf('code') > 0) {
          this.verification = false;
          // tslint:disable-next-line: no-string-literal
          this.toastr.info(Response['user']);
          // tslint:disable-next-line: no-string-literal
        } else if (Response['user'].indexOf('found') > 0) {
          // tslint:disable-next-line: no-string-literal
          this.toastr.info(Response['user']);
        }
      });
    }
  }

  public Verify(code) {
    this.spinner.show();
    this.service.VerifyCode(code).subscribe(Response => {
      if (Response !== 'failure') {
        this.spinner.hide();
        this.route.navigate(['/']);
      } else {
        this.toastr.warning('Not a valid code. Sure you typed it correctly?');
      }
    });
  }

  GetValue(val) {
    if (val !== '' && val != null) {
      this.disablebutton = false;
    } else {
      this.disablebutton = true;
    }
  }
}
