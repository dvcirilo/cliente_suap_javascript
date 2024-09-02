"use strict";

class ClientParams{
  constructor(authHost, clientID, redirectURI, scope){
    this.resourceURL = authHost + '/api/eu/';
    this.authorizationURL = authHost + '/o/authorize/';
    this.accessTokenURL = authHost + '/o/token/';
    this.logoutURL = authHost + '/o/revoke_token/';
    this.responseType = 'code';
    this.grantType = 'authorization_code';
    this.clientID = clientID;
    this.scope = scope;
    this.redirectURI = redirectURI;
  }
}

class Token{

  constructor(clientParams){
    this.clientParams = clientParams;
    this.value = sessionStorage.getItem("oauthToken");
    this.expirationTime = sessionStorage.getItem("oauthTokenExpirationTime");
    this.scope = sessionStorage.getItem("oauthScope");
  }

  revokeSession(){
    sessionStorage.removeItem("oauthToken")
    sessionStorage.removeItem("oauthTokenExpirationTime")
    sessionStorage.removeItem("oauthScope")
  }
}

class OAuthClient {

  constructor(clientParams){
    this.clientParams = clientParams;
    this.urlParams = new URLSearchParams(window.location.search);

    this.token = new Token(this.clientParams);

  }

  async init(){
    if (!this.isAuthenticated()){
      if (this.urlParams.get("code")) {
        if (this.urlParams.get("state") === sessionStorage.getItem("oauthState")) {
          await this.authorize(this.urlParams.get("code"));
          window.location = this.clientParams.redirectURI;
        }
      } else {
        this.generateCode();
      }
    }
  }

  generateCode(){

    sessionStorage.setItem("oauthState",random_string(16));
    sessionStorage.setItem("oauthCodeVerifier",random_string(48));

  }

  getLoginURL(){
    let loginUrl = this.clientParams.authorizationURL +
      "?response_type=" + this.clientParams.responseType +
      "&client_id="     + this.clientParams.clientID +
      "&scope="         + this.clientParams.scope +
      "&state="         + sessionStorage.getItem("oauthState") +
      "&code_challenge="            + base64_urlencode(sha256bin(sessionStorage.getItem("oauthCodeVerifier"))) +
      "&code_challenge_method=S256" +
      "&redirect_uri="  + this.clientParams.redirectURI;
    return loginUrl;

  }

  isAuthenticated(){
    if (sessionStorage.getItem("oauthToken")){
      return true;
    } else {
      return false;
    }
  }

  async authorize(code){
    if (sessionStorage.getItem("oauthToken")){
      self.revokeSession();
    }
    let data = {'grant_type': this.clientParams.grantType,
           'client_id': this.clientParams.clientID,
           "code_verifier": sessionStorage.getItem("oauthCodeVerifier"),
           "code": code,
           "redirect_uri": this.clientParams.redirectURI};

    try {
      const response = await fetch(this.clientParams.accessTokenURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: Object.keys(data).map(key => key + '=' + data[key]).join('&')
      });

      let responseData = await response.json();
      let startTime = new Date().getTime(); // O valor em milissegundos.
      let finishTime = new Date(startTime + responseData.expires_in * 1000); // O objeto Date.

      sessionStorage.setItem("oauthToken", responseData.access_token);
      sessionStorage.setItem("oauthTokenExpirationTime", finishTime);
      sessionStorage.setItem("oauthScope", responseData.scope);

    } catch (e){
      alert('Falha na comunicação com o Servidor');
      console.log(e);
    }
  }

  async logout(){
    let data = {"token": this.token.value,
                "client_id": this.clientParams.clientID,
                "redirect_uri": this.clientParams.redirectURI};

    try{
      const response = await fetch(this.clientParams.logoutURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: Object.keys(data).map(key => key + '=' + data[key]).join('&')
      });

      this.token.revokeSession();

      window.location = this.clientParams.redirectURI;
    } catch (e){
      alert('Falha na comunicação com o Servidor');
      console.log(e);
    }
  }

  async getResource(endpoint, callback){
    let data = {"token": this.token.value,
                "client_id": this.clientParams.clientID,
                "redirect_uri": this.clientParams.redirectURI};

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {"Authorization": "Bearer " + this.token.value,
                  "Accept": "application/json"}
    });

    callback(await response.json());
  }
}
