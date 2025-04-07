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

/**
 * 
 * @export
 * @interface ShiftDto
 */
export interface ShiftDto {
    /**
     * 
     * @type {string}
     * @memberof ShiftDto
     */
    '_id': string;
    /**
     * 
     * @type {string}
     * @memberof ShiftDto
     */
    'company': string;
    /**
     * 
     * @type {string}
     * @memberof ShiftDto
     */
    'companyName': string;
    /**
     * 
     * @type {string}
     * @memberof ShiftDto
     */
    'name': string;
    /**
     * 
     * @type {string}
     * @memberof ShiftDto
     */
    'description': string;
    /**
     * 
     * @type {Array<string>}
     * @memberof ShiftDto
     */
    'tags': Array<string>;
    /**
     * 
     * @type {boolean}
     * @memberof ShiftDto
     */
    'isOpen': boolean;
    /**
     * 
     * @type {string}
     * @memberof ShiftDto
     */
    'startTime': string;
    /**
     * 
     * @type {string}
     * @memberof ShiftDto
     */
    'endTime': string;
    /**
     * 
     * @type {number}
     * @memberof ShiftDto
     */
    'pay': number;
    /**
     * 
     * @type {Location}
     * @memberof ShiftDto
     */
    'location': Location;
    /**
     * 
     * @type {string}
     * @memberof ShiftDto
     */
    'userHired'?: string;
    /**
     * 
     * @type {boolean}
     * @memberof ShiftDto
     */
    'isComplete': boolean;
    /**
     * 
     * @type {number}
     * @memberof ShiftDto
     */
    'rating'?: number;
}

