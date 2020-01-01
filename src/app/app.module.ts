import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './Components/home/home.component';
import { LoginComponent } from '../app/Components/user/login/login.component';
import { SignupComponent } from '../app/Components/user/signup/signup.component';
import { SocialLoginModule, AuthServiceConfig } from 'angularx-social-login';
import {HttpClientModule} from '@angular/common/http';
import { GoogleLoginProvider } from 'angularx-social-login';
import { ProfileComponent } from './Components/user/profile/profile.component';
import { MeetingComponent } from './Components/user/meeting/meeting.component';
import { CamComponent } from './Components/user/cam/cam.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ClipboardModule } from 'ngx-clipboard';
import { NotfoundRoomComponent } from './Components/error/notfound-room/notfound-room.component';
import { LayoutComponent } from './Components/user/layout/layout.component';
import { FooterComponent } from './Components/user/footer/footer.component';
import { PricingComponent } from './Components/information/pricing/pricing.component';
import { ContactsaleComponent } from './Components/information/contactsale/contactsale.component';
import { SupportComponent } from './Components/support/support/support.component';
import { SupportHomeComponent } from './Components/support/support-home/support-home.component';
import { SupportCenterComponent } from './Components/support/support-center/support-center.component';
import { AppearinComponent } from './Components/support/appearin/appearin.component';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { SubscriptionComponent } from './Components/user/subscription/subscription.component';
import { AccountComponent } from './Components/user/account/account.component';
import { PrivacyComponent } from './Components/user/privacy/privacy.component';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { FeedbackComponent } from './Components/user/feedback/feedback.component';
import { LeaveFeedbackComponent } from './Components/user/leave-feedback/leave-feedback.component';
import { DataService } from './service/sharedservice';
import { TeamComponent } from './Components/information/team/team.component';
import { PressComponent } from './Components/information/press/press.component';
import { TeamHomeComponent } from './Components/information/team-home/team-home.component';
import { PolicyComponent } from './Components/information/policy/policy.component';
import { CookiePolicyComponent } from './Components/information/cookie-policy/cookie-policy.component';
import { ProductsComponent } from './Components/information/products/products.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { OrderDetailComponent } from './Components/user/order-detail/order-detail.component';
import { PackageComponent } from './Components/user/package/package.component';
import { NgxStripeModule } from 'ngx-stripe';
import { BussinessAccountComponent } from './Components/user/bussiness-account/bussiness-account.component';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';

const socketconfig: SocketIoConfig = {
  url: 'https://wherebybackend.herokuapp.com/',
  options: {}
};
// http://localhost:3000/
const config = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider('227820843238-cf4p34h5see8ts5a4okf9g070fveejaj.apps.googleusercontent.com')
  } // '457073428004-kv306i0rbr9efoa85pvjj1ip2ht2p6ud.apps.googleusercontent.com'
]);


const firebaseConfig = {
  apiKey: 'AIzaSyCnMTKLzNWYwBaRFifQQfRZJvRvDe9bVLo',
  authDomain: 'easymeet-30b6d.firebaseapp.com',
  databaseURL: 'https://easymeet-30b6d.firebaseio.com',
  projectId: 'easymeet-30b6d',
  storageBucket: 'easymeet-30b6d.appspot.com',
  messagingSenderId: '498366038838',
  appId: '1:498366038838:web:7ea5cf58c367e2e384a997',
  measurementId: 'G-Y9DPSLWVL8'
};

export function provideConfig() {
  return config;
}


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    SignupComponent,
    ProfileComponent,
    MeetingComponent,
    CamComponent,
    NotfoundRoomComponent,
    LayoutComponent,
    FooterComponent,
    PricingComponent,
    ContactsaleComponent,
    SupportComponent,
    SupportHomeComponent,
    SupportCenterComponent,
    AppearinComponent,
    SubscriptionComponent,
    AccountComponent,
    PrivacyComponent,
    FeedbackComponent,
    LeaveFeedbackComponent,
    TeamComponent,
    PressComponent,
    TeamHomeComponent,
    PolicyComponent,
    CookiePolicyComponent,
    ProductsComponent,
    OrderDetailComponent,
    PackageComponent,
    BussinessAccountComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    SocialLoginModule,
    BrowserAnimationsModule,
    ClipboardModule,
    HttpClientModule,
    ToastrModule.forRoot(),
    NgxSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    PickerModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    NgxStripeModule.forRoot('pk_test_xR2HN61CGq9RMib7obP5ieDz00Xhs4nu2t'),
    SocketIoModule.forRoot(socketconfig),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [{
    provide: AuthServiceConfig,
    useFactory: provideConfig
  }, {provide: LocationStrategy, useClass: HashLocationStrategy}, DataService, HomeComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
