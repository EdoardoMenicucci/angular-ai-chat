import { Component, OnInit } from '@angular/core';
import { ChatService } from '../services/chat-service.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  isLoggedIn: boolean = false;
  private authErrorSubscription!: Subscription;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    // Stato iniziale
    this.isLoggedIn = this.chatService.isAuthenticated();

    // Sottoscrizione agli errori di autenticazione
    this.authErrorSubscription = this.chatService
      .getAuthErrors()
      .subscribe(() => {
        this.isLoggedIn = false;
      });
  }

  logout(): void {
    this.chatService.logout();
    this.isLoggedIn = false;
  }

  ngOnDestroy(): void {
    if (this.authErrorSubscription) {
      this.authErrorSubscription.unsubscribe();
    }
  }
}
