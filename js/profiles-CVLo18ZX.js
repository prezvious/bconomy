<!doctype html>
<html data-bs-theme="dark">
  <head>
    <!-- Title -->
    <title>Bconomy - Log In</title>
    <!-- Meta viewport -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- App icons -->
    <link
      rel="icon"
      type="image/png"
      href="/resources/icons/favicon-96x96.png"
      sizes="96x96"
    />
    <link rel="icon" type="image/svg+xml" href="/resources/icons/favicon.svg" />
    <link rel="shortcut icon" href="/favicon.ico" />
    <link
      rel="apple-touch-icon"
      sizes="180x180"
      href="/resources/icons/apple-touch-icon.png"
    />
    <meta name="apple-mobile-web-app-title" content="Bconomy" />
    <link rel="manifest" href="/site.webmanifest" />
    <!-- Theming tags -->
    <meta name="theme-color" content="#212529" />
    <!-- Bootstrap -->
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css"
      rel="stylesheet"
      integrity="sha384-4Q6Gf2aSP4eDXB8Miphtr37CMZZQ5oXLH2yaXMJ2w8e2ZtHTl7GptT4jmndRuHDT"
      crossorigin="anonymous"
    />
    <!-- Stylesheet -->
    <link rel="stylesheet" href="/resources/css/style.css" />
    <!-- Link/login page specific -->
    <!-- Google auth script -->
    <script src="https://accounts.google.com/gsi/client" async defer></script>
    <!-- hCaptcha script -->
    <script src="https://js.hcaptcha.com/1/api.js" async defer></script>
    <!-- Smart App Banner -->
    <meta name="apple-itunes-app" content="app-id=6746172667" />
  </head>
  <body>
    <!-- Request send email modal -->
    <div class="modal fade" id="emailModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5">Sign In with Email</h1>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <p>
              We'll send a login code to your email if you've played before, or
              create an account for you if you're new.
            </p>
            <form action="/auth/sendcode" method="post">
              <input type="hidden" name="codeType" value="login" />
              <div class="form-floating">
                <input
                  name="email"
                  type="email"
                  class="form-control"
                  placeholder="Email"
                  required
                />
                <label>Email</label>
              </div>
              <div
                data-callback="onEmailSendCaptchaDone"
                style="margin-top: 8px"
                class="h-captcha"
                data-sitekey="fe9242e4-a374-493a-a4a8-596c766a27e0"
                data-theme="dark"
              ></div>
              <button
                disabled
                id="sendEmailButton"
                class="w-100 btn btn-md btn-primary"
                type="submit"
                style="margin-top: 5px"
              >
                Send Code
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
    <!-- Submit login code modal -->
    <div class="modal fade" id="loginCodeModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5">Enter Login Code</h1>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <p>We sent a code to your email address. Please enter it below.</p>
            <form action="/auth/submitcode" method="post">
              <input type="hidden" name="codeType" value="login" />
              <div class="form-floating">
                <input
                  id="loginCodeEmailInput"
                  name="email"
                  type="email"
                  class="form-control"
                  placeholder="Email"
                />
                <label>Email</label>
              </div>
              <div class="form-floating" style="margin-top: 5px">
                <input
                  name="code"
                  class="form-control"
                  placeholder="Code"
                  required
                />
                <label>Code</label>
              </div>
              <button
                class="w-100 btn btn-md btn-primary"
                type="submit"
                style="margin-top: 5px"
              >
                Submit Code
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
    <!-- Main content -->
    <div
      class="text-center m-auto"
      style="
        max-width: 330px;
        margin-top: 80px !important;
        margin-bottom: 30px !important;
      "
    >
      <img
        src="https://assets.bconomy.net/brand/outlinethin.webp"
        alt="Bconomy logo"
        style="
          height: 80px;
          width: 80px;
          display: inline-block;
          margin-bottom: 25px;
          margin-right: 4px;
        "
      />
      <img
        src="https://assets.bconomy.net/brand/wordmark.webp"
        alt="Bconomy wordmark"
        style="filter: invert(1); height: 70px; margin-bottom: 10px"
      />
      <a role="button" class="w-100 btn btn-lg btn-success" href="/playnow">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style="width: 22px; height: 22px; position: relative; bottom: 2.6px"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path
            fill-rule="evenodd"
            d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708z"
          />
          <path
            fill-rule="evenodd"
            d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708z"
          />
        </svg>
        Play Now!
      </a>
      <hr />
      <a
        role="button"
        id="funnydiscord"
        style="
          position: relative;
          margin-bottom: 5px;
          --bs-btn-bg: #5865f2;
          --bs-btn-border-color: #5865f2;
          --bs-btn-hover-bg: #5865f2;
        "
        class="w-100 btn btn-md btn-primary"
        href="https://discord.com/oauth2/authorize?client_id=766776316690432033&response_type=code&redirect_uri=https%3A%2F%2Fbconomy.net%2Fauth%2Fdiscord&scope=identify%20guilds.members.read"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style="
            width: 20px;
            height: 20px;
            position: absolute;
            left: 11px;
            margin-top: 2px;
          "
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path
            d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z"
          />
        </svg>
        <span style="margin-left: 24px; font-size: 15px"
          >Continue with Discord</span
        >
      </a>
      <div
        id="g_id_onload"
        data-client_id="165297649855-1n9ubr13kquva0kh6ll6c4n1rdh81t62.apps.googleusercontent.com"
        data-context="signin"
        data-ux_mode="redirect"
        data-login_uri="https://bconomy.net/auth/google"
        data-auto_prompt="false"
      ></div>
      <div
        class="g_id_signin"
        data-type="standard"
        data-shape="rectangular"
        data-theme="outline"
        data-text="continue_with"
        data-size="large"
        data-logo_alignment="left"
      ></div>
      <button
        type="button"
        data-bs-toggle="modal"
        data-bs-target="#emailModal"
        style="
          position: relative;
          margin-top: 5px;
          background-color: cornflowerblue;
          border: none;
        "
        class="w-100 btn btn-md btn-primary"
        href="https://discord.com/api/oauth2/authorize?client_id=766776316690432033&redirect_uri=https%3A%2F%2Fbcono.my%2Fdiscordauth&response_type=code&scope=identify%20guilds%20guilds.members.read"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style="
            width: 20px;
            height: 20px;
            position: absolute;
            left: 11px;
            margin-top: 2px;
          "
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path
            d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586zm3.436-.586L16 11.801V4.697z"
          />
        </svg>
        <span style="margin-left: 24px; font-size: 15px"
          >Continue with Email</span
        >
      </button>
    </div>
    <!-- Scripts -->
    <!-- Bootstrap JS -->
    <script
      src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.min.js"
      integrity="sha384-RuyvpeZCxMJCqVUGFI0Do1mQrods/hhxYlcVfGPOfQtPJh0JCw12tUAZ/Mv10S7D"
      crossorigin="anonymous"
    ></script>
    <!-- Login page script -->
    <script type="module" src="/login/script.js"></script>
  <script type="module" src="https://static.cloudflareinsights.com/beacon.min.js/v4513226cdae34746b4dedf0b4dfa099e1781791509496" integrity="sha512-ZE9pZaUXND66v380QUtch/5sE9tPFh2zg45pR2PB0CVkCtOREv2AJKkSidISWkysEuQ0EH8faUU5du78bx87UQ==" data-cf-beacon='{"version":"2024.11.0","token":"690c3a77768641bbad1f9da8bb6c94b2","r":1}' crossorigin="anonymous"></script>
</body>
</html>
