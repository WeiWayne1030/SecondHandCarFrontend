import { NGXLogger } from 'ngx-logger';
import { SessionStorageService } from '../service/session-storage.service';
import { DateTime } from 'luxon';
import { Inject, Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { RouteState } from '../models/route-state';
import { ROUTE_STATE_KEY } from '../constants/global-constants.constant';
import { isNullOrEmpty } from '../utils/common-functions';
import { ContextData } from '../models/context-data';

const ROUTE_STATE_KEEP_HOURS = 7 * 24;
const ROUTE_URL_KEY = 'routeUrl';

/**
 * 轉址服務
 */
@Injectable({
  providedIn: 'root',
})
export class RouteStateService {

  private isEnableRouteTypeCheck = true;
  private _isLanding = false;

  constructor(
    public router: Router,
    public storageService: SessionStorageService,
    private logger: NGXLogger,
    private location: Location,
    private contextData: ContextData) {
    this.router.events
      .subscribe({
        next: event => {
          this.logger.debug('RouteStateService - constructor - router events:', event);
          if (event instanceof NavigationStart) {
            const eventObj = event as NavigationStart;
            this.logger.info(`RouteStateService - constructor - Router.events subscribe: Ready to redirect to ${eventObj.url}.`, eventObj);

            // 檢查是否為非內部 routing 方式
            if (this.isEnableRouteTypeCheck && eventObj.navigationTrigger !== 'imperative'
              && !eventObj.restoredState && ![this.routeUrl, '/'].includes(eventObj.url)
              && !eventObj.url.startsWith('/login')) {
              this.logger.info(`RouteStateService - constructor - Router.events subscribe: Redirect to home.`, eventObj);
              this.navigateTo('/');
            }
            this.isEnableRouteTypeCheck = true;
          } else if (event instanceof NavigationEnd) {
            const eventObj = event as NavigationEnd;
            if (this._isLanding === false) {
              this._isLanding = true;
            }
            this.storageService.setItem(ROUTE_URL_KEY, eventObj.url);
          }
        }
      });
  }

  get isLanding(): boolean {
    return this._isLanding;
  }

  get routeUrl(): string | null {
    return this.storageService.getItem(ROUTE_URL_KEY) ?? null;
  }

  get currentUrl(): string {
    return this.router.url;
  }

  get state(): any {
    return this.location.getState();
  }

  /**
   * 取得目前 routing 資料
   *
   * @return {*}  {(RouteState | null)}
   * @memberof RouteStateService
   */
  getCurrent(): RouteState | null {
    const path = this.router.url;
    const routeStates = this.getRouteStates(path);
    return routeStates.length > 0 ? routeStates[routeStates.length - 1] : null;
  }

  /**
   * 取得指定 routing 資料
   *
   * @param {number} key
   * @return {*}  {(RouteState | null)}
   * @memberof RouteStateService
   */
  getRouteData(key: number | string): RouteState | null {
    this.cleanRouteData();
    const path = this.router.url;
    const routeStates = Number.isInteger(key)
      ? this.getRouteStates(path, key as number)
      : this.getRouteStates(key as string);
    return routeStates.length > 0 ? routeStates[0] : null;
  }

  /**
   * 清除過期 routing 資料
   *
   * @memberof RouteStateService
   */
  cleanRouteData(): void {
    const currentDate = new Date().getTime();
    const limitNum = 1000 * 3600 * 24;
    const allRouteStates = this.getAllRouteStates();
    const hasExpired = allRouteStates.filter(x => (currentDate - x.time!) >= limitNum);
    if (isNullOrEmpty(hasExpired)) {
      const routeStates = allRouteStates.filter(x => (currentDate - x.time!) < limitNum);
      this.saveRouteStates(routeStates);
      this.removeExpiredRouteStates();
    }
  }

  /**
   * 產生 id
   *
   * @readonly
   * @type {number}
   * @memberof RouteStateService
   */
  get newTid(): number {
    return new Date().getTime();
  }

  /**
   * 轉址
   *
   * @param {string} path 轉導路徑
   * @param {*} [data] 資料
   * @param {boolean} [isNewTab] 是否開新頁籤
   * @param {boolean} [isCleanAll] 是否清除所有 routing 資料(註:此參數已無功能)
   * @param {number} [tid] 指定 id
   * @return {*}  {void}
   * @memberof RouteStateService
   */
  navigateTo(path: string, data?: any, isNewTab?: boolean, isCleanAll?: boolean, tid?: number): void {
    if (isNullOrEmpty(path)) {
      throw new Error('Path must not be empty.');
    }

    const tmpData = {
      ...(data ?? {})
    };

    if (isNullOrEmpty(tmpData.companyId) && isNullOrEmpty(this.contextData.companyId) === false) {
      tmpData.companyId = this.contextData.companyId;
    }

    if (isNewTab) {
      tmpData.grantExternalAccess = true;
    }

    const routeStates = this.getAllRouteStates();
    const time = tid ?? new Date().getTime();
    const routeFrom = this.router.url;
    const routeState: RouteState = { path, data: tmpData, time, tid, routeFrom };
    routeStates.push(routeState);
    this.saveRouteStates(routeStates);
    this.removeExpiredRouteStates();

    if (isNewTab) {
      window.open(path, '_blank');
      return;
    }

    if (path === this.router.url) {
      this.router.navigateByUrl('/reload', { skipLocationChange: true, state: { routeState } })
        .then(() => this.router.navigateByUrl(path, { state: { routeState } }));
    } else {
      this.router.navigateByUrl(path, { state: { routeState } });
    }
  }

  /**
   * 轉址(開新視窗)
   *
   * @param {string} path
   * @param {*} [data]
   * @param {boolean} [isCleanAll]
   * @param {number} [tid]
   * @memberof RouteStateService
   */
  navigateToNewWindow(path: string, data?: any, isCleanAll?: boolean, tid?: number): void {
    if (isNullOrEmpty(path)) {
      throw new Error('Path must not be empty.');
    }

    const tmpData = {
      ...(data ?? {})
    };

    if (isNullOrEmpty(tmpData.companyId) === false && isNullOrEmpty(this.contextData.companyId) === false) {
      tmpData.companyId = this.contextData.companyId;
    }

    tmpData.grantExternalAccess = true;

    const routeStates = this.getAllRouteStates();
    const time = tid ?? new Date().getTime();
    const routeFrom = this.router.url;
    const routeState: RouteState = { path, data: tmpData, time, tid, routeFrom };
    routeStates.push(routeState);
    this.saveRouteStates(routeStates);
    this.removeExpiredRouteStates();

    window.open(path, '_blank', 'toolbar=0,menubar=0');
  }

  /**
   * 回上一頁
   *
   * @memberof RouteStateService
   */
  loadPrevious(): void {
    const routeStates = this.getAllRouteStates();
    if (routeStates.length === 0) {
      this.navigateTo('/');
      return;
    }
    routeStates.pop();
    this.saveRouteStates(routeStates);
    this.removeExpiredRouteStates();
    this.isEnableRouteTypeCheck = false;
    this.location.back();
  }

  /**
   * 清除所有 routing 資料
   *
   * @memberof RouteStateService
   */
  clear(): void {
    this.storageService.removeItem(ROUTE_STATE_KEY);
  }

  /**
   * 清除指定路徑 routing 資料
   *
   * @param {string} path
   * @memberof RouteStateService
   */
  remove(path: string): void {
    const allRouteStates = this.getAllRouteStates();
    const routeStates = allRouteStates.filter(x => x.path !== path);
    this.saveRouteStates(routeStates);
  }

  saveCacheData(data: any): void {
    const path = this.router.url;
    const allRouteStates = this.getAllRouteStates();
    const routeFrom = this.router.url;
    const filteredRoutes = allRouteStates.filter(x => x.path?.endsWith(path));
    let targetRoute = filteredRoutes.length > 0 ? filteredRoutes[filteredRoutes.length - 1] : undefined;
    if (!targetRoute) {
      const time = new Date().getTime();
      targetRoute = { path, time, routeFrom };
      allRouteStates.push(targetRoute);
    }
    targetRoute.cacheData = data;
    this.saveRouteStates(allRouteStates);
  }

  private saveRouteStates(routeStates: RouteState[]): void {
    this.storageService.setItem(ROUTE_STATE_KEY, routeStates);
  }

  private getAllRouteStates(): RouteState[] {
    const routeStates: RouteState[] = this.storageService.getItem(ROUTE_STATE_KEY) ?? [];
    return routeStates;
  }

  private getRouteStates(path: string, tid?: number): RouteState[] {
    const allRouteStates = this.getAllRouteStates();
    const routeStatesFilterResult = allRouteStates
      .filter(x => x.path?.endsWith(path));
    const result = isNullOrEmpty(tid) ? routeStatesFilterResult : routeStatesFilterResult.filter(o => o.tid === tid);
    return result;
  }

  private removeExpiredRouteStates(): void {
    const expiredTime = DateTime.now().minus({ hours: ROUTE_STATE_KEEP_HOURS }).toJSDate().getTime();
    const allRouteStates = this.getAllRouteStates();
    const routeStates = allRouteStates.filter(x => x.time >= expiredTime);
    this.saveRouteStates(routeStates);
  }
}
