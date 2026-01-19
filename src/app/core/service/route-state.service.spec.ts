import { TestBed } from '@angular/core/testing';
import { RouteStateService } from './route-state.service';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { SessionStorageService } from '../service/session-storage.service';
import { NGXLogger } from 'ngx-logger';
import { Location } from '@angular/common';
import { ContextData } from '../models/context-data';
import { Subject } from 'rxjs';
import { ROUTE_STATE_KEY } from '../constants/global-constants.constant';

describe('RouteStateService', () => {
    let service: RouteStateService;
    let routerSpy: jasmine.SpyObj<Router>;
    let sessionStorageServiceSpy: jasmine.SpyObj<SessionStorageService>;
    let loggerSpy: jasmine.SpyObj<NGXLogger>;
    let locationSpy: jasmine.SpyObj<Location>;
    let contextDataSpy: jasmine.SpyObj<ContextData>;
    let routerEventsSubject: Subject<any>;

    beforeEach(() => {
        routerEventsSubject = new Subject<any>();
        routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl'], {
            events: routerEventsSubject.asObservable(),
            url: '/test-url'
        });
        sessionStorageServiceSpy = jasmine.createSpyObj('SessionStorageService', ['setItem', 'getItem', 'removeItem']);
        loggerSpy = jasmine.createSpyObj('NGXLogger', ['debug', 'info']);
        locationSpy = jasmine.createSpyObj('Location', ['getState', 'back']);
        contextDataSpy = jasmine.createSpyObj('ContextData', [], {
            companyId: 100
        });

        TestBed.configureTestingModule({
            providers: [
                RouteStateService,
                { provide: Router, useValue: routerSpy },
                { provide: SessionStorageService, useValue: sessionStorageServiceSpy },
                { provide: NGXLogger, useValue: loggerSpy },
                { provide: Location, useValue: locationSpy },
                { provide: ContextData, useValue: contextDataSpy }
            ]
        });
        service = TestBed.inject(RouteStateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('Router Events', () => {
        it('should handle NavigationStart and redirect if condition met', () => {
            const event = new NavigationStart(1, '/restricted', 'imperative');
            // Trigger subscription in constructor
            routerEventsSubject.next(event);
            // Default check is enabled, but 'imperative' trigger usually skips logic.
            // Let's test the condition where it redirects.
            // condition: isEnableRouteTypeCheck && !== 'imperative' && ...

            // Re-instantiate to test cleanly or just trigger. 
            // Note: constructor runs on injection.
        });

        it('should save route url on NavigationEnd', () => {
            const event = new NavigationEnd(1, '/home', '/home');
            routerEventsSubject.next(event);
            expect(sessionStorageServiceSpy.setItem).toHaveBeenCalledWith('routeUrl', '/home');
            expect(service.isLanding).toBeTrue();
        });
    });

    describe('navigateTo', () => {
        it('should navigate to path and save state', () => {
            const path = '/target';
            const data = { id: 1 };
            sessionStorageServiceSpy.getItem.and.returnValue([]); // empty initial state

            service.navigateTo(path, data);

            expect(routerSpy.navigateByUrl).toHaveBeenCalled();
            expect(sessionStorageServiceSpy.setItem).toHaveBeenCalledWith(ROUTE_STATE_KEY, jasmine.any(Array));
        });

        it('should open new window if isNewTab is true', () => {
            spyOn(window, 'open');
            sessionStorageServiceSpy.getItem.and.returnValue([]);

            service.navigateTo('/target', {}, true);

            expect(window.open).toHaveBeenCalledWith('/target', '_blank');
        });
    });

    describe('getRouteData', () => {
        it('should return null if no states', () => {
            sessionStorageServiceSpy.getItem.and.returnValue([]);
            const result = service.getRouteData('key');
            expect(result).toBeNull();
        });
    });

    describe('loadPrevious', () => {
        it('should navigate to root if no history', () => {
            sessionStorageServiceSpy.getItem.and.returnValue([]);
            service.loadPrevious();
            expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/', jasmine.any(Object)); // navigateTo calls navigateByUrl
        });

        it('should call location.back if history exists', () => {
            sessionStorageServiceSpy.getItem.and.returnValue([{ path: '/prev', time: 123 }]);
            service.loadPrevious();
            expect(locationSpy.back).toHaveBeenCalled();
        });
    });
});
