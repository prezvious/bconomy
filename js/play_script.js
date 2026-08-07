const stateStr = (Math.random() + "").slice(2, 8) + "jeff";
document.cookie =
  "discordCsrfState=" + stateStr + "; path=/; SameSite=Lax; Secure";
document.getElementById("funnydiscord").href += "&state=" + stateStr;

window.onEmailSendCaptchaDone = () =>
  (document.getElementById("sendEmailButton").disabled = false);

const queryParamCodeSentEmail = new URLSearchParams(location.search).get(
  "codeSentEmail",
);
if (typeof queryParamCodeSentEmail === "string") {
  window.history.replaceState(null, document.title, "/login");
  new bootstrap.Modal(document.getElementById("loginCodeModal")).show();
  document.getElementById("loginCodeEmailInput").value = decodeURIComponent(
    queryParamCodeSentEmail,
  );
}
