import { CONTEXT_DATA_KEY } from './../constants/global-constants.constant';
import { Injectable, InjectionToken } from "@angular/core";
import { SessionStorageService } from "../service/session-storage.service";

/**
 * 頁面功能資訊
 *
 * @export
 * @class ContextData
 * @description
 * 放置該功能相資料，例如：processDefKey, taskDefKey, companyId, functionCode, systemId...
 * (目前只放 companyId)
 */
@Injectable({
    providedIn: 'root'
})
export class ContextData {

    constructor(private storageService: SessionStorageService) {

    }

    get companyId(): number | undefined {
        const data = this.storageService.getItem(CONTEXT_DATA_KEY) ?? {};
        return data.companyId;
    }

    set companyId(value: number | undefined) {
        this.storageService.setItem(CONTEXT_DATA_KEY, { companyId: value });
    }

    getValue(): any {
        const data = this.storageService.getItem(CONTEXT_DATA_KEY) ?? {};
        return data;
    }
}
