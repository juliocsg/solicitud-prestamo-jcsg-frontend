import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      <div
        *ngFor="let n of notifications"
        class="toast"
        [ngClass]="'toast-' + n.type"
        (click)="dismiss(n.id)"
      >
        <span class="toast-icon">
          <ng-container [ngSwitch]="n.type">
            <span *ngSwitchCase="'success'">&#10004;</span>
            <span *ngSwitchCase="'error'">&#10008;</span>
            <span *ngSwitchDefault>&#8505;</span>
          </ng-container>
        </span>
        <span class="toast-message">{{ n.message }}</span>
        <button class="toast-close" (click)="dismiss(n.id); $event.stopPropagation()">&times;</button>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 72px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 380px;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 18px;
      border-radius: 8px;
      color: white;
      font-size: 0.9rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      cursor: pointer;
      animation: slideIn 0.3s ease-out;
    }
    .toast-success { background: #2e7d32; }
    .toast-error { background: #c62828; }
    .toast-info { background: #1565c0; }
    .toast-icon { font-size: 1.1rem; }
    .toast-message { flex: 1; }
    .toast-close {
      background: none;
      border: none;
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
      opacity: 0.7;
      padding: 0 4px;
    }
    .toast-close:hover { opacity: 1; }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private sub!: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.sub = this.notificationService.notifications.subscribe(notification => {
      this.notifications.push(notification);
      setTimeout(() => this.dismiss(notification.id), 4000);
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  dismiss(id: number) {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }
}
