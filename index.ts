/*
 * Copyright 2018 Okta Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Based off the test web app from the AppAuthJS library found here: https://github.com/openid/AppAuth-JS/tree/master/app

import {AuthorizationRequest} from '@openid/appauth/built/authorization_request';
import {AuthorizationNotifier, AuthorizationRequestHandler} from '@openid/appauth/built/authorization_request_handler';
import {AuthorizationServiceConfiguration} from '@openid/appauth/built/authorization_service_configuration';
import {log} from '@openid/appauth/built/logger';
import {RedirectRequestHandler} from '@openid/appauth/built/redirect_based_handler';
import {GRANT_TYPE_AUTHORIZATION_CODE, GRANT_TYPE_REFRESH_TOKEN, TokenRequest} from '@openid/appauth/built/token_request';
import {BaseTokenRequestHandler, TokenRequestHandler} from '@openid/appauth/built/token_request_handler';
import {TokenResponse} from '@openid/appauth/built/token_response';
import { AuthorizationResponse } from '@openid/appauth/built/authorization_response';
import { StringMap } from '@openid/appauth/built/types';

const openIdConnectUrl = 'https://micahtrex2.trexcloud.com';
const clientId = '0oa1ogqkuDgN6GXfd0w6';
const redirectUri = 'http://localhost:8000/redirect.html';
const scope = 'openid';

/* Some interface declarations for Material design lite. */

/**
 * Snackbar options.
 */
declare interface SnackBarOptions {
  message: string;
  timeout?: number;
}

/**
 * Interface that defines the MDL Material Snack Bar API.
 */
declare interface MaterialSnackBar {
  showSnackbar: (options: SnackBarOptions) => void;
}
/**
 * The Test application.
 */
export class App {
  private notifier: AuthorizationNotifier;
  private authorizationHandler: AuthorizationRequestHandler;
  private tokenHandler: TokenRequestHandler;

  // state
  private configuration: AuthorizationServiceConfiguration|undefined;
  private request: AuthorizationRequest|undefined;
  private response: AuthorizationResponse|undefined;
  private code: string|undefined;
  private tokenResponse: TokenResponse|undefined;

  constructor(public snackbar: Element) {
    this.notifier = new AuthorizationNotifier();
    this.authorizationHandler = new RedirectRequestHandler();
    this.tokenHandler = new BaseTokenRequestHandler();
    // set notifier to deliver responses
    this.authorizationHandler.setAuthorizationNotifier(this.notifier);
    // set a listener to listen for authorization responses
    this.notifier.setAuthorizationListener((request, response, error) => {
      let alert =         
        'Made authorization request with:\n\n' +
        
        'client_id=' + request.clientId + '\n' +
        'redirect_uri=' + request.redirectUri + '\n' +
        'scope=' + request.scope + '\n' +
        'response_type=' + request.responseType + '\n'
      if (request.extras) {
        alert +=         
          'code_challenge=' + request.extras.code_challenge + '\n' +
          'code_challenge_method=' + request.extras.code_challenge_method
      }

      window.alert(alert)

      log('Authorization request complete ', request, response, error);
      if (response) {
        this.request = request;
        this.response = response;
        this.code = response.code;
        this.showMessage(`Authorization Code ${response.code}`);
      }
    });
  }

  showMessage(message: string) {
    const snackbar = (this.snackbar as any)['MaterialSnackbar'] as MaterialSnackBar;
    snackbar.showSnackbar({message: message});
  }

  fetchServiceConfiguration() {
    AuthorizationServiceConfiguration.fetchFromIssuer(openIdConnectUrl)
        .then(response => {
          log('Fetched service configuration', response);
          this.configuration = response;
          
          let alert = 'Fetched Configuration from well known endpoint:\n\n' +
            'authorization endpoint: ' + response.authorizationEndpoint + '\n' +
            'token endpoint: ' + response.tokenEndpoint + '\n'
            
          window.alert(alert)
          
          this.showMessage('Completed fetching configuration');
        })
        .catch(error => {
          log('Something bad happened', error);
          this.showMessage(`Something bad happened ${error}`)
        });
  }

  makeAuthorizationRequest() {
    // create a request
    let request = new AuthorizationRequest({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scope,
      response_type: AuthorizationRequest.RESPONSE_TYPE_CODE,
      state: undefined,
      extras: {'prompt': 'consent'}
    });

    if (this.configuration) {
      this.authorizationHandler.performAuthorizationRequest(this.configuration, request);
    } else {
      this.showMessage(
        'Fetch Authorization Service configuration, before you make the authorization request.');
    }
  }

  makeTokenRequest() {
    if (!this.configuration) {
      this.showMessage('Please fetch service configuration.');
      return;
    }
    
    if (!this.code) {
      this.showMessage(`Make authorizaton request before token request`)
      return;
    }
    
    let alert =         
      'About to make token request with:\n\n' +
      
      'client_id=' + clientId + '\n' +
      'redirect_uri=' + redirectUri + '\n' +
      'grant_type=' + GRANT_TYPE_AUTHORIZATION_CODE + '\n' +
      'code=' + this.code;

    let request: TokenRequest|null = null;

    let extras: StringMap|undefined = undefined;
    if (this.request && this.request.internal) {
      extras = {};
      extras['code_verifier'] = this.request.internal['code_verifier'];
      
      alert += '\ncode_verifier=' + this.request.internal['code_verifier']
    }
    
    window.alert(alert);

    // use the code to make the token request.
    request = new TokenRequest({
      client_id: clientId,
      redirect_uri: redirectUri,
      grant_type: GRANT_TYPE_AUTHORIZATION_CODE,
      code: this.code,
      refresh_token: undefined,
      extras: extras
    });

    this.tokenHandler.performTokenRequest(this.configuration, request)
      .then(response => {
        
        this.code = undefined; // kill code
        this.showMessage(`Obtained an access token ${response.accessToken}.`);
      })
      .catch(error => {
        log('Something bad happened', error);
        this.showMessage(`Something bad happened ${error}`)
      });
  }

  checkForAuthorizationResponse() {
    this.authorizationHandler.completeAuthorizationRequestIfPossible();
  }
}

// export App
(window as any)['App'] = App;
