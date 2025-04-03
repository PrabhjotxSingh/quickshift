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
import type { UserDto } from './user-dto';
// May contain unused imports in some cases
// @ts-ignore
import type { UserRole } from './user-role';

/**
 * 
 * @export
 * @interface Register200Response
 */
export interface Register200Response {
    /**
     * 
     * @type {string}
     * @memberof Register200Response
     */
    '_id': string;
    /**
     * 
     * @type {string}
     * @memberof Register200Response
     */
    'id': string;
    /**
     * 
     * @type {string}
     * @memberof Register200Response
     */
    'email': string;
    /**
     * 
     * @type {string}
     * @memberof Register200Response
     */
    'username': string;
    /**
     * 
     * @type {string}
     * @memberof Register200Response
     */
    'password': string;
    /**
     * 
     * @type {string}
     * @memberof Register200Response
     */
    'firstName': string;
    /**
     * 
     * @type {string}
     * @memberof Register200Response
     */
    'lastName': string;
    /**
     * 
     * @type {Array<UserRole>}
     * @memberof Register200Response
     */
    'roles': Array<UserRole>;
    /**
     * 
     * @type {Array<string>}
     * @memberof Register200Response
     */
    'skills': Array<string>;
}

