import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket$?: WebSocketSubject<any>;
  private token: string = '';

  constructor(private http: HttpClient) {}

  setToken(token: string) {
    this.token = token;
    this.initializeWebSocket();
  }

  private initializeWebSocket() {
    if (this.socket$) {
      this.socket$.complete();
    }

    this.socket$ = webSocket({
      url: `ws://localhost:5000/ws?token=${this.token}`,
      deserializer: (msg) => JSON.parse(msg.data),
      serializer: (msg) => JSON.stringify(msg),
    });
  }

  login(): Observable<any> {
    // Test credentials for development
    const credentials = {
      username: 'test',
      password: 'password',
    };

    return this.http.post('http://localhost:5000/auth/login', credentials).pipe(
      tap((response: any) => {
        if (response.token) {
          this.setToken(response.token);
        }
      })
    );
  }

  sendMessage(message: string): void {
    if (!this.socket$) {
      console.error('WebSocket not initialized');
      return;
    }

    const msg = {
      text: message,
      role: 'user',
    };
    const data = JSON.stringify(msg);
    this.socket$.next(data);
  }

  onMessage(): Observable<any> {
    if (!this.socket$) {
      this.initializeWebSocket();
    }
    return this.socket$!.asObservable();
  }

  closeConnection(): void {
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = undefined;
    }
  }
}
