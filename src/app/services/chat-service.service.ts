import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket$ = webSocket('ws://localhost:5000/ws'); // Sostituisci con l'URL del tuo backend

  sendMessage(message: string): void {
    const msg = {
      text: message,
      role: 'user',
    };
    const data = JSON.stringify(msg); // Converte in JSON
    this.socket$.next(data); // Invia il messaggio al backend
  }

  onMessage(): Observable<any> {
    return this.socket$.asObservable(); // Restituisce un Observable per ascoltare i messaggi
  }

  closeConnection(): void {
    this.socket$.complete();
  }
}
