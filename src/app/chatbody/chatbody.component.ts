import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from '../services/chat-service.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chatbody',
  templateUrl: './chatbody.component.html',
  styleUrls: ['./chatbody.component.css'],
})
export class ChatbodyComponent implements OnInit, OnDestroy {
  messages: Array<{ text: string; role: string }> = [];
  newMessage: string = '';
  partialText: string = '';
  isLoading: boolean = false;
  isAuthenticated: boolean = false;
  private authErrorSubscription!: Subscription;

  loginForm = {
    username: '',
    password: '',
  };

  private messageSubscription!: Subscription; // Gestisce la sottoscrizione

  constructor(private chatService: ChatService) {}

  initializeConnection(): void {
    this.messageSubscription = this.chatService.onMessage().subscribe(
      (data) => {
        console.log('Messaggio ricevuto:', data);
        this.messages.push(data);
      },
      (error) => {
        console.error('Errore nella ricezione del messaggio:', error);
      }
    );
  }

  ngOnInit(): void {
    // Controlla autenticazione iniziale
    if (this.chatService.isAuthenticated()) {
      this.isAuthenticated = true;
      this.initializeConnection();
    }

    // Sottoscrizione agli errori di autenticazione
    this.authErrorSubscription = this.chatService
      .getAuthErrors()
      .subscribe(() => {
        this.isAuthenticated = false;
        this.messages = [];
        // Opzionale: mostra messaggio all'utente
        console.log('Sessione scaduta, effettua nuovamente il login');
      });
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      this.chatService.sendMessage(this.newMessage); // Invia il messaggio al backend
      this.newMessage = ''; // Resetta l'input
    }
  }

  handleLogin(): void {
    this.chatService.login(this.loginForm).subscribe(
      () => {
        this.isAuthenticated = true;
        this.initializeConnection();
      },
      (error) => {
        console.error('Login failed:', error);
      }
    );
  }

  resetChat(): void {
    this.messages = []; // Svuota l'array dei messaggi
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    setTimeout(() => this.initializeConnection(), 500); //ristabilisci la connessione
  }

  ngOnDestroy(): void {
    // Chiudi la sottoscrizione memory leaks
     if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    if (this.authErrorSubscription) {
      this.authErrorSubscription.unsubscribe();
    }
    this.chatService.closeConnection();
  }
}
