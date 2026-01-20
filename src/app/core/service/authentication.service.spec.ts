import { TestBed } from '@angular/core/testing';
import { AuthenticationService } from './authentication.service';
import { SessionStorageService } from './session-storage.service';
import { User, UserRole } from '../models/user.model';
import { first } from 'rxjs/operators';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let sessionStorageService: jasmine.SpyObj<SessionStorageService>;

  const mockBuyer: User = { id: 1, username: 'buyer', role: UserRole.Buyer, name: '我是買家' };
  const mockSeller: User = { id: 2, username: 'seller', role: UserRole.Seller, name: '我是賣家' };
  const mockAdmin: User = { id: 3, username: 'admin', role: UserRole.Admin, name: '我是管理者' };

  function setup(storedUser: User | null = null) {
    const spy = jasmine.createSpyObj('SessionStorageService', ['getItem', 'setItem', 'removeItem']);
    
    if (storedUser) {
      spy.getItem.and.returnValue(JSON.stringify(storedUser));
    } else {
      spy.getItem.and.returnValue(null);
    }

    TestBed.configureTestingModule({
      providers: [
        AuthenticationService,
        { provide: SessionStorageService, useValue: spy }
      ]
    });
    service = TestBed.inject(AuthenticationService);
    sessionStorageService = TestBed.inject(SessionStorageService) as jasmine.SpyObj<SessionStorageService>;
  }

  describe('Initialization', () => {
    it('should initialize with null user when session storage is empty', (done) => {
      setup();
      service.currentUser$.pipe(first()).subscribe(user => {
        expect(user).toBeNull();
        done();
      });
    });

    it('should initialize with user from session storage', (done) => {
      setup(mockBuyer);
      service.currentUser$.pipe(first()).subscribe(user => {
        expect(user).toEqual(mockBuyer);
        expect(service.currentUserValue).toEqual(mockBuyer);
        done();
      });
    });
  });

  describe('Login', () => {
    beforeEach(() => setup());

    it('should log in a buyer successfully', (done) => {
      service.login('buyer', 'password').subscribe(user => {
        expect(user?.role).toBe(UserRole.Buyer);
        expect(user?.name).toBe('我是買家');
        expect(sessionStorageService.setItem).toHaveBeenCalledWith('currentUser', JSON.stringify(user));
        done();
      });
    });

    it('should log in a seller successfully', (done) => {
      service.login('seller', 'password').subscribe(user => {
        expect(user?.role).toBe(UserRole.Seller);
        expect(service.currentUserValue).toEqual(user!);
        done();
      });
    });

    it('should log in an admin successfully', (done) => {
      service.login('admin', 'password').subscribe(user => {
        expect(user?.role).toBe(UserRole.Admin);
        expect(service.currentUserValue).toEqual(user!);
        done();
      });
    });

    it('should fail login with wrong password', (done) => {
      service.login('buyer', 'wrongpassword').subscribe(user => {
        expect(user).toBeNull();
        expect(service.currentUserValue).toBeNull();
        expect(sessionStorageService.setItem).not.toHaveBeenCalled();
        done();
      });
    });

    it('should fail login with non-existent username', (done) => {
      service.login('nonexistent', 'password').subscribe(user => {
        expect(user).toBeNull();
        expect(service.currentUserValue).toBeNull();
        expect(sessionStorageService.setItem).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe('Logout', () => {
    it('should clear current user and remove from session storage', (done) => {
      setup(mockBuyer); // Start as logged in
      
      service.logout();
      
      service.currentUser$.pipe(first()).subscribe(user => {
        expect(user).toBeNull();
        expect(service.currentUserValue).toBeNull();
        expect(sessionStorageService.removeItem).toHaveBeenCalledWith('currentUser');
        done();
      });
    });
  });

  describe('Role Checking', () => {
    beforeEach(() => setup());

    it('isLoggedIn() should return true when user is logged in and false otherwise', (done) => {
      expect(service.isLoggedIn()).toBeFalse();
      service.login('buyer', 'password').subscribe(() => {
        expect(service.isLoggedIn()).toBeTrue();
        done();
      });
    });

    it('hasRole() should correctly identify user role', (done) => {
      service.login('seller', 'password').subscribe(() => {
        expect(service.hasRole(UserRole.Seller)).toBeTrue();
        expect(service.hasRole(UserRole.Buyer)).toBeFalse();
        expect(service.hasRole(UserRole.Admin)).toBeFalse();
        done();
      });
    });

    it('role observables should emit correct boolean values', (done) => {
      // Test for admin
      service.login('admin', 'password').subscribe(() => {
        service.isAdmin$.pipe(first()).subscribe(isAdmin => expect(isAdmin).toBeTrue());
        service.isBuyer$.pipe(first()).subscribe(isBuyer => expect(isBuyer).toBeFalse());
        service.isSeller$.pipe(first()).subscribe(isSeller => expect(isSeller).toBeFalse());

        // Test after logout
        service.logout();
        service.isAdmin$.pipe(first()).subscribe(isAdmin => expect(isAdmin).toBeFalse());
        done();
      });
    });
  });
});
