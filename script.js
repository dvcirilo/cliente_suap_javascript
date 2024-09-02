let parameters = new ClientParams(SUAP_URL, CLIENT_ID, REDIRECT_URI, SCOPE);
let suap = new OAuthClient(parameters);
suap.init();

$(document).ready(function () {
    $("#suap-login-button").attr('href', suap.getLoginURL());
    if (suap.isAuthenticated()) {
        $('.is-authenticated').removeClass("is-hidden");
        $('#token').text(suap.token.value);
        $('#validade_token').text(suap.token.expirationTime);
        $("#escopos_autorizados").text(suap.token.scope);
        $("#escopos").val(suap.token.scope);
    } else {
        $('.is-anonymous').removeClass("is-hidden");
    }
});
$("#suap-logout-button").click(function(){
    suap.logout();
});
$("#suap-resource-button").click(function(){
    if (suap.isAuthenticated()) {
        let scope = $("#escopos").val();
        let callback = function (response) {
            $("#response").text(JSON.stringify(response, null, 4));
        };
        suap.getResource(suap.clientParams.resourceURL, callback);
    }
});
