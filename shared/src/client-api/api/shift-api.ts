/* tslint:disable */
/* eslint-disable */
/**
 * My API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import type { Configuration } from '../configuration';
import type { AxiosPromise, AxiosInstance, RawAxiosRequestConfig } from 'axios';
import globalAxios from 'axios';
// Some imports not used depending on template conditions
// @ts-ignore
import { DUMMY_BASE_URL, assertParamExists, setApiKeyToObject, setBasicAuthToObject, setBearerAuthToObject, setOAuthToObject, setSearchParams, serializeDataIfNeeded, toPathString, createRequestFunction } from '../common';
// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS, type RequestArgs, BaseAPI, RequiredError, operationServerMap } from '../base';
// @ts-ignore
import type { CreateShiftRequest } from '../models';
// @ts-ignore
import type { Get200Response } from '../models';
/**
 * ShiftApi - axios parameter creator
 * @export
 */
export const ShiftApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * 
         * @param {string} shiftId 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        _delete: async (shiftId: string, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'shiftId' is not null or undefined
            assertParamExists('_delete', 'shiftId', shiftId)
            const localVarPath = `/Shift`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'DELETE', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            if (shiftId !== undefined) {
                localVarQueryParameter['shiftId'] = shiftId;
            }


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @param {string} shiftId 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        applyToShift: async (shiftId: string, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'shiftId' is not null or undefined
            assertParamExists('applyToShift', 'shiftId', shiftId)
            const localVarPath = `/Shift/Apply`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            if (shiftId !== undefined) {
                localVarQueryParameter['shiftId'] = shiftId;
            }


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @param {CreateShiftRequest} createShiftRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        create: async (createShiftRequest: CreateShiftRequest, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'createShiftRequest' is not null or undefined
            assertParamExists('create', 'createShiftRequest', createShiftRequest)
            const localVarPath = `/Shift`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(createShiftRequest, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @param {string} id 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        get: async (id: string, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'id' is not null or undefined
            assertParamExists('get', 'id', id)
            const localVarPath = `/Shift`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            if (id !== undefined) {
                localVarQueryParameter['id'] = id;
            }


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @param {string} shiftId 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getApplicants: async (shiftId: string, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'shiftId' is not null or undefined
            assertParamExists('getApplicants', 'shiftId', shiftId)
            const localVarPath = `/Shift/Applicants`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            if (shiftId !== undefined) {
                localVarQueryParameter['shiftId'] = shiftId;
            }


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @param {Array<string>} [tags] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getAvailableShifts: async (tags?: Array<string>, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/Shift/Available`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            if (tags) {
                localVarQueryParameter['tags'] = tags;
            }


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @param {boolean} getUpcoming 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getUserShifts: async (getUpcoming: boolean, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'getUpcoming' is not null or undefined
            assertParamExists('getUserShifts', 'getUpcoming', getUpcoming)
            const localVarPath = `/Shift/User`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            if (getUpcoming !== undefined) {
                localVarQueryParameter['getUpcoming'] = getUpcoming;
            }


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @param {string} shiftId 
         * @param {CreateShiftRequest} createShiftRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        update: async (shiftId: string, createShiftRequest: CreateShiftRequest, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'shiftId' is not null or undefined
            assertParamExists('update', 'shiftId', shiftId)
            // verify required parameter 'createShiftRequest' is not null or undefined
            assertParamExists('update', 'createShiftRequest', createShiftRequest)
            const localVarPath = `/Shift`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'PATCH', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            if (shiftId !== undefined) {
                localVarQueryParameter['shiftId'] = shiftId;
            }


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(createShiftRequest, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * ShiftApi - functional programming interface
 * @export
 */
export const ShiftApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = ShiftApiAxiosParamCreator(configuration)
    return {
        /**
         * 
         * @param {string} shiftId 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async _delete(shiftId: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<string>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator._delete(shiftId, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['ShiftApi._delete']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        /**
         * 
         * @param {string} shiftId 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async applyToShift(shiftId: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<any>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.applyToShift(shiftId, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['ShiftApi.applyToShift']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        /**
         * 
         * @param {CreateShiftRequest} createShiftRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async create(createShiftRequest: CreateShiftRequest, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Get200Response>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.create(createShiftRequest, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['ShiftApi.create']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        /**
         * 
         * @param {string} id 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async get(id: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Get200Response>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.get(id, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['ShiftApi.get']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        /**
         * 
         * @param {string} shiftId 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getApplicants(shiftId: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<any>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getApplicants(shiftId, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['ShiftApi.getApplicants']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        /**
         * 
         * @param {Array<string>} [tags] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getAvailableShifts(tags?: Array<string>, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<any>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getAvailableShifts(tags, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['ShiftApi.getAvailableShifts']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        /**
         * 
         * @param {boolean} getUpcoming 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getUserShifts(getUpcoming: boolean, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<any>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getUserShifts(getUpcoming, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['ShiftApi.getUserShifts']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        /**
         * 
         * @param {string} shiftId 
         * @param {CreateShiftRequest} createShiftRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async update(shiftId: string, createShiftRequest: CreateShiftRequest, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Get200Response>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.update(shiftId, createShiftRequest, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['ShiftApi.update']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
    }
};

/**
 * ShiftApi - factory interface
 * @export
 */
export const ShiftApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = ShiftApiFp(configuration)
    return {
        /**
         * 
         * @param {string} shiftId 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        _delete(shiftId: string, options?: RawAxiosRequestConfig): AxiosPromise<string> {
            return localVarFp._delete(shiftId, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @param {string} shiftId 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        applyToShift(shiftId: string, options?: RawAxiosRequestConfig): AxiosPromise<any> {
            return localVarFp.applyToShift(shiftId, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @param {CreateShiftRequest} createShiftRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        create(createShiftRequest: CreateShiftRequest, options?: RawAxiosRequestConfig): AxiosPromise<Get200Response> {
            return localVarFp.create(createShiftRequest, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @param {string} id 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        get(id: string, options?: RawAxiosRequestConfig): AxiosPromise<Get200Response> {
            return localVarFp.get(id, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @param {string} shiftId 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getApplicants(shiftId: string, options?: RawAxiosRequestConfig): AxiosPromise<any> {
            return localVarFp.getApplicants(shiftId, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @param {Array<string>} [tags] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getAvailableShifts(tags?: Array<string>, options?: RawAxiosRequestConfig): AxiosPromise<any> {
            return localVarFp.getAvailableShifts(tags, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @param {boolean} getUpcoming 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getUserShifts(getUpcoming: boolean, options?: RawAxiosRequestConfig): AxiosPromise<any> {
            return localVarFp.getUserShifts(getUpcoming, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @param {string} shiftId 
         * @param {CreateShiftRequest} createShiftRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        update(shiftId: string, createShiftRequest: CreateShiftRequest, options?: RawAxiosRequestConfig): AxiosPromise<Get200Response> {
            return localVarFp.update(shiftId, createShiftRequest, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * ShiftApi - interface
 * @export
 * @interface ShiftApi
 */
export interface ShiftApiInterface {
    /**
     * 
     * @param {string} shiftId 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ShiftApiInterface
     */
    _delete(shiftId: string, options?: RawAxiosRequestConfig): AxiosPromise<string>;

    /**
     * 
     * @param {string} shiftId 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ShiftApiInterface
     */
    applyToShift(shiftId: string, options?: RawAxiosRequestConfig): AxiosPromise<any>;

    /**
     * 
     * @param {CreateShiftRequest} createShiftRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ShiftApiInterface
     */
    create(createShiftRequest: CreateShiftRequest, options?: RawAxiosRequestConfig): AxiosPromise<Get200Response>;

    /**
     * 
     * @param {string} id 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ShiftApiInterface
     */
    get(id: string, options?: RawAxiosRequestConfig): AxiosPromise<Get200Response>;

    /**
     * 
     * @param {string} shiftId 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ShiftApiInterface
     */
    getApplicants(shiftId: string, options?: RawAxiosRequestConfig): AxiosPromise<any>;

    /**
     * 
     * @param {Array<string>} [tags] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ShiftApiInterface
     */
    getAvailableShifts(tags?: Array<string>, options?: RawAxiosRequestConfig): AxiosPromise<any>;

    /**
     * 
     * @param {boolean} getUpcoming 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ShiftApiInterface
     */
    getUserShifts(getUpcoming: boolean, options?: RawAxiosRequestConfig): AxiosPromise<any>;

    /**
     * 
     * @param {string} shiftId 
     * @param {CreateShiftRequest} createShiftRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ShiftApiInterface
     */
    update(shiftId: string, createShiftRequest: CreateShiftRequest, options?: RawAxiosRequestConfig): AxiosPromise<Get200Response>;

}

/**
 * ShiftApi - object-oriented interface
 * @export
 * @class ShiftApi
 * @extends {BaseAPI}
 */
export class ShiftApi extends BaseAPI implements ShiftApiInterface {
    /**
     * 
     * @param {string} shiftId 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ShiftApi
     */
    public _delete(shiftId: string, options?: RawAxiosRequestConfig) {
        return ShiftApiFp(this.configuration)._delete(shiftId, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @param {string} shiftId 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ShiftApi
     */
    public applyToShift(shiftId: string, options?: RawAxiosRequestConfig) {
        return ShiftApiFp(this.configuration).applyToShift(shiftId, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @param {CreateShiftRequest} createShiftRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ShiftApi
     */
    public create(createShiftRequest: CreateShiftRequest, options?: RawAxiosRequestConfig) {
        return ShiftApiFp(this.configuration).create(createShiftRequest, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @param {string} id 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ShiftApi
     */
    public get(id: string, options?: RawAxiosRequestConfig) {
        return ShiftApiFp(this.configuration).get(id, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @param {string} shiftId 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ShiftApi
     */
    public getApplicants(shiftId: string, options?: RawAxiosRequestConfig) {
        return ShiftApiFp(this.configuration).getApplicants(shiftId, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @param {Array<string>} [tags] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ShiftApi
     */
    public getAvailableShifts(tags?: Array<string>, options?: RawAxiosRequestConfig) {
        return ShiftApiFp(this.configuration).getAvailableShifts(tags, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @param {boolean} getUpcoming 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ShiftApi
     */
    public getUserShifts(getUpcoming: boolean, options?: RawAxiosRequestConfig) {
        return ShiftApiFp(this.configuration).getUserShifts(getUpcoming, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @param {string} shiftId 
     * @param {CreateShiftRequest} createShiftRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ShiftApi
     */
    public update(shiftId: string, createShiftRequest: CreateShiftRequest, options?: RawAxiosRequestConfig) {
        return ShiftApiFp(this.configuration).update(shiftId, createShiftRequest, options).then((request) => request(this.axios, this.basePath));
    }
}

