let parameters = new ClientParams(SUAP_URL, CLIENT_ID, REDIRECT_URI, SCOPE);
let suap = new OAuthClient(parameters);

suap.init();

document.getElementById("suap-login-button").setAttribute("href", suap.getLoginURL());

if (suap.isAuthenticated()) {
  document.querySelector(".is-authenticated").classList.remove("is-hidden");
  document.getElementById("token").textContent = suap.token.value;
  document.getElementById("validade_token").textContent = suap.token.expirationTime;
  document.getElementById("escopos_autorizados").textContent = suap.token.scope;
  document.getElementById("escopos").value = suap.token.scope;
} else {
  document.querySelector(".is-anonymous").classList.remove("is-hidden");
}

document.getElementById("suap-logout-button")
  .addEventListener("click", () => {
    suap.logout();
  });

document.getElementById("suap-resource-button")
  .addEventListener("click", () => {
    if (suap.isAuthenticated()) {
      let scope = document.getElementById("escopos").value;
      const callback = (response) => {
        document.getElementById("response").textContent = JSON.stringify(response, null, 4);
      };
      suap.getResource(suap.clientParams.resourceURL, callback);
    }
  });
