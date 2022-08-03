import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { BehaviorSubject } from 'rxjs';
import { AuthServiceService } from './auth-service.service';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private _alerts = new BehaviorSubject<string[]>([]);
  get alerts() {
    return this._alerts.asObservable();
  }

  constructor(
    private db: AngularFireDatabase,
    private auth: AuthServiceService
  ) {}
  // emit alert
  emitAlert(alert: string) {
    const f = this._alerts.value;
    f.push(alert);
    this._alerts.next(f);
  }
  clearAlerts() {
    this._alerts.next([]);
  }
}