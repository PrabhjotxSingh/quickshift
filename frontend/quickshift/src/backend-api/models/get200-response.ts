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


// May contain unused imports in some cases
// @ts-ignore
import type { Location } from './location';
// May contain unused imports in some cases
// @ts-ignore
import type { ShiftDto } from './shift-dto';

/**
 * 
 * @export
 * @interface Get200Response
 */
export interface Get200Response {
    /**
     * 
     * @type {string}
     * @memberof Get200Response
     */
    '_id': string;
    /**
     * 
     * @type {string}
     * @memberof Get200Response
     */
    'company': string;
    /**
     * 
     * @type {string}
     * @memberof Get200Response
     */
    'companyName': string;
    /**
     * 
     * @type {string}
     * @memberof Get200Response
     */
    'name': string;
    /**
     * 
     * @type {string}
     * @memberof Get200Response
     */
    'description': string;
    /**
     * 
     * @type {Array<string>}
     * @memberof Get200Response
     */
    'tags': Array<string>;
    /**
     * 
     * @type {boolean}
     * @memberof Get200Response
     */
    'isOpen': boolean;
    /**
     * 
     * @type {string}
     * @memberof Get200Response
     */
    'startTime': string;
    /**
     * 
     * @type {string}
     * @memberof Get200Response
     */
    'endTime': string;
    /**
     * 
     * @type {number}
     * @memberof Get200Response
     */
    'pay': number;
    /**
     * 
     * @type {Location}
     * @memberof Get200Response
     */
    'location': Location;
    /**
     * 
     * @type {string}
     * @memberof Get200Response
     */
    'userHired'?: string;
    /**
     * 
     * @type {boolean}
     * @memberof Get200Response
     */
    'isComplete': boolean;
    /**
     * 
     * @type {number}
     * @memberof Get200Response
     */
    'rating'?: number;
}

