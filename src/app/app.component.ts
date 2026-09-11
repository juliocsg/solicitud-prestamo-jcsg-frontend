import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { NotificationComponent } from './components/notification/notification.component';
import { loadUserFromStorage } from './store/auth/auth.actions';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationComponent],
  template: `
    <app-notification></app-notification>
    <router-outlet></router-outlet>
  `,
})
export class AppComponent implements OnInit {
  title = 'frontend';

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(loadUserFromStorage());
  }
}
