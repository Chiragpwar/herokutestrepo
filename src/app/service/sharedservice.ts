import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

@Injectable()
export class DataService {
  private messageSource = new BehaviorSubject('');
  currentIds = this.messageSource.asObservable();
  subscriptions: Subscription[] = [];
  connectionStatusMessage: string;
  connectionStatus: string;
  constructor() {
  }

  getIds(id: any) {
    this.messageSource.next(id);
  }
}

