import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, UserRole } from '../models/user.model';
import { SessionStorageService } from './session-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  // Dummy user data
  private readonly DUMMY_USERS: User[] = [
    { id: 1, username: 'buyer', password: 'password', role: UserRole.Buyer, name: '我是買家' },
    { id: 2, username: 'seller', password: 'password', role: UserRole.Seller, name: '我是賣家' },
    { id: 3, username: 'admin', password: 'password', role: UserRole.Admin, name: '我是管理者' }
  ];

  constructor(private sessionStorageService: SessionStorageService) {
    const storedUser = this.sessionStorageService.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser ? JSON.parse(storedUser) : null);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(username: string, password?: string): Observable<User | null> {
    const user = this.DUMMY_USERS.find(u => u.username === username && u.password === password);
    if (user) {
      // 在實際應用中，後端不應該返回密碼
      const userToStore = { ...user };
      delete userToStore.password;

      this.sessionStorageService.setItem('currentUser', JSON.stringify(userToStore));
      this.currentUserSubject.next(userToStore);
      return of(userToStore);
    }
    return of(null);
  }

  logout(): void {
    this.sessionStorageService.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  hasRole(role: UserRole): boolean {
    return this.isLoggedIn() && this.currentUserValue?.role === role;
  }

  get isBuyer$(): Observable<boolean> {
    return this.currentUser$.pipe(map(user => !!user && user.role === UserRole.Buyer));
  }

  get isSeller$(): Observable<boolean> {
    return this.currentUser$.pipe(map(user => !!user && user.role === UserRole.Seller));
  }

  get isAdmin$(): Observable<boolean> {
    return this.currentUser$.pipe(map(user => !!user && user.role === UserRole.Admin));
  }
}
