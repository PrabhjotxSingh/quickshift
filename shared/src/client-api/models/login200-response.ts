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
import type { LoginResponse } from './login-response';
// May contain unused imports in some cases
// @ts-ignore
import type { UserDto } from './user-dto';

/**
 * 
 * @export
 * @interface Login200Response
 */
export interface Login200Response {
    /**
     * 
     * @type {string}
     * @memberof Login200Response
     */
    'refreshToken'?: string;
    /**
     * 
     * @type {string}
     * @memberof Login200Response
     */
    'accessToken'?: string;
    /**
     * 
     * @type {UserDto}
     * @memberof Login200Response
     */
    'user'?: UserDto;
}

