import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from '../services/chat-service.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chatbody',
  templateUrl: './chatbody.component.html',
  styleUrls: ['./chatbody.component.css'],
})
export class ChatbodyComponent {
  messages: Array<{ text: string; role: string }> = [];
  newMessage: string = '';
  partialText: string = '';
  isLoading: boolean = false;

  private messageSubscription!: Subscription; // Gestisce la sottoscrizione

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    // Sottoscrivi ai messaggi ricevuti dal backend
    this.messageSubscription = this.chatService.onMessage().subscribe(
      (data) => {
        console.log('Messaggio ricevuto:', data); // Log per debug
        this.messages.push(data); // Aggiungi il messaggio all'array
      },
      (error) => {
        console.error('Errore nella ricezione del messaggio:', error);
      }
    );
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      this.chatService.sendMessage(this.newMessage); // Invia il messaggio al backend
      this.newMessage = ''; // Resetta l'input
    }
  }

  ngOnDestroy(): void {
    // Chiudi la sottoscrizione per prevenire memory leaks
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    this.chatService.closeConnection();
  }
}
