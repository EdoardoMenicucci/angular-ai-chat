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
        if (data.role == 'user') {
          if (this.partialText.length > 0) {
            this.messages.push({ text: this.partialText, role: 'ia' }); // Aggiunge il messaggio parziale alla lista
          }
          this.partialText = ''; // Resetta il messaggio parziale
          this.messages.push(data); // Aggiunge il messaggio alla lista
        } else {
          this.partialText += data.text; // Mostra il messaggio parziale
        }
      },
      (error) => {
        console.error('Errore nella ricezione del messaggio:', error);
      }
    );
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      this.isLoading = true; // Mostra il loader
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
