var orgName = "";
var otplessLoginButton = null;
var OTPLESS_STYLES = {
  LOGIN_BUTTON_STYLE: {
    PARENT: `
            border: none; 
            background: transparent; 
            outline: none;
            height: 60px;
            width: 100%;
            background: #23D366;
            border-radius: 20px;
            color: #FFFFFF;
            cursor: pointer;
        `,
    CONTENT: `
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        `,
    TEXT: `
            font-weight: 600;
            font-size: 20px;
            margin: 0;
        `,
    IMG: `
            width: 30px;
        `,
  },
  SUCCESS_MODAL: {
    PARENT: `
            z-index: 100;
            position: relative;
        `,
    MASK: `
            height: 100vh;
            width: 100vw;
            position: fixed;
            top: 0;
            left: 0;
            background: rgb(0 0 0 / 13%);
            backdrop-filter: blur(3px);
        `,
    CONTENT: {
      COMMON: `
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                align-items: center;
                height: 400px;
                background: rgb(255, 255, 255);
                position: fixed;
                left: 0;
                right: 0;
                box-shadow: rgb(0 0 0 / 8%) 0px 4px 25px;
                border-radius: 22px;
            `,
      DESKTOP: `
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 400px;
            `,
      MOBILE: `
                width: 90vw;
                bottom: 20px;
                margin: 0 auto;
            `,
    },
    TEXT: `
            font-size: 1.5rem;
            font-weight: 500;
            font-family: Helvetica;
            width: 80%;
            text-align: center;
            line-height: 1.5;
            margin: 20px;
        `,
    GIF: `
            height: 100px;
            width: 100px;
            border-radius: 100%;
            margin-top: 30px;
        `,
    OK_BUTTON: `
            font-family: Helvetica;
            font-size: 18px;
            font-weight: 500;
            width: 80%;
            text-align: center;
            background: #F3F6F9;
            padding: 15px;
            margin: 20px;
            border-radius: 16px;
            cursor: pointer;
        `,
  },
};

function otplessSdk() {
  otplessOrgname();
}

function otplessOrgname() {
  var scripts = document.getElementsByTagName("script");
  for (let index = 0; index < scripts.length; index++) {
    const element = scripts[index];
    var isOtplessJs = element.src.match(new RegExp("authlink.me"));
    if (isOtplessJs) {
      var src = element.src.split(".")[0].split("https://")[1];
      orgName = src;
    }
  }
  if (["satu", "bobby", "finixpartners"].includes(orgName)) otplessAuthScript();
  else otplessGetButton();
}

function otplessAuthScript() {
  const OTPlessAuthScript = document.getElementById("OTPless-Auth-Script");
  const script = document.createElement("script");
  script.src = "https://otpless.com/android-js-sdk/auth.js";
  script.id = "OTPless-Auth-Script";
  const head = document.querySelectorAll("head")[0];
  !!!OTPlessAuthScript && head.insertBefore(script, head.firstChild);
}

function otplessGetButton() {
  otplessLoginButton = document.getElementById("whatsapp-login");
  if (!!!otplessLoginButton) {
    let otplessButtonInterval = setInterval(() => {
      otplessLoginButton = document.getElementById("whatsapp-login");
      if (otplessLoginButton) {
        clearInterval(otplessButtonInterval);
        otplessLoginButton.removeAttribute("hidden");
        otplessWalogin();
      }
    }, 500);
  } else {
    otplessWalogin();
  }
}

function otplessWalogin() {
  otplessLoginButton = document.getElementById("whatsapp-login");
  otplessLoginButton.style.cssText = OTPLESS_STYLES.LOGIN_BUTTON_STYLE.PARENT;
  var waId = localStorage.getItem("otpless_waId");
  otplessInit();
  if (waId) {
    otplessGetUserDetails();
  } else {
    otplessLoginButton.innerHTML = `
                <div style="${OTPLESS_STYLES.LOGIN_BUTTON_STYLE.CONTENT}">
                    <img style="${OTPLESS_STYLES.LOGIN_BUTTON_STYLE.IMG}" src="https://${orgName}.authlink.me/assets/whatsapp.svg" />
                    <p style="${OTPLESS_STYLES.LOGIN_BUTTON_STYLE.TEXT}">Continue with WhatsApp</p>
                </div>
            `;
    otplessLoginButton.onclick = () => {
      var authlink = `https://${orgName}.authlink.me?redirectUri=${encodeURIComponent(
        window.location.href
      )}`;
      window.open(authlink, "_self");
    };
  }
}

function otplessInit() {
  var source = document.referrer;
  if (source.includes("authlink.me")) {
    var queryParams = Object.fromEntries(
      new URLSearchParams(window.location.search)
    );
    var waId = queryParams["waId"];
    if (waId) {
      localStorage.setItem("otpless_waId", waId);
      let url = window.location.href.split("?")[0];
      window.history.pushState({}, document.title, url);
      if (otplessLoginButton.getAttribute("popupRequired") === "false") {
        window.otpless?.();
      } else {
        otplessSuccessModal();
      }
      otplessGetUserDetails();
    } else {
      //do nothing, next step -> user has to click on the  whatsapp login button
    }
  } else {
    //Access Denied
  }
}

function otplessGetUserDetails() {
  var userId = localStorage.getItem("otpless_waId");
  let xhr = new XMLHttpRequest();

  const logoutProcess = () => {
    localStorage.removeItem("otpless_waId");
    otplessLoginButton.innerHTML = `
            <div style="${OTPLESS_STYLES.LOGIN_BUTTON_STYLE.CONTENT}">
                <img style="${OTPLESS_STYLES.LOGIN_BUTTON_STYLE.IMG}" src="https://${orgName}.authlink.me/assets/whatsapp.svg" />
                <p style="${OTPLESS_STYLES.LOGIN_BUTTON_STYLE.TEXT}">Continue with WhatsApp</p>
            </div>
        `;
    otplessLoginButton.onclick = () => {
      var authlink = `https://${orgName}.authlink.me?redirectUri=${encodeURIComponent(
        window.location.href
      )}`;
      window.open(authlink, "_self");
    };
  };

  //Send waId to server
  xhr.open("POST", `https://${orgName}.authlink.me/metaverse`);
  xhr.setRequestHeader("Accept", "application/json");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        var data = JSON.parse(xhr.responseText);
        if (data.success) {
          otplessLoginButton.innerHTML = `
                        <div style="${OTPLESS_STYLES.LOGIN_BUTTON_STYLE.CONTENT}">
                            <img style="${OTPLESS_STYLES.LOGIN_BUTTON_STYLE.IMG}" src="https://${orgName}.authlink.me/assets/whatsapp.svg" />
                            <p style="${OTPLESS_STYLES.LOGIN_BUTTON_STYLE.TEXT}">+${data.data.userMobile}</p>
                        </div>
                    `;
          otplessLoginButton.onclick = () => {
            if (otplessLoginButton.getAttribute("popupRequired") === "false") {
              window.otpless?.();
            } else {
              otplessSuccessModal();
            }
          };
        } else {
          logoutProcess();
        }
      } else {
        logoutProcess();
      }
    }
  };
  xhr.send(JSON.stringify({ userId, api: "getUserDetail" }));

  //
}

function otplessSuccessModal() {
  var SuccessModalDiv = document.createElement("div");
  SuccessModalDiv.id = "otpless-success-modal";
  SuccessModalDiv.innerHTML = `
        <div style="${
          OTPLESS_STYLES.SUCCESS_MODAL.MASK
        }" onclick="otplessSuccessModalClose()"></div>
        <div style="${
          OTPLESS_STYLES.SUCCESS_MODAL.CONTENT.COMMON +
          OTPLESS_STYLES.SUCCESS_MODAL.CONTENT[
            window.screen.width > 768 ? "DESKTOP" : "MOBILE"
          ]
        }">
            <img style="${
              OTPLESS_STYLES.SUCCESS_MODAL.GIF
            }" src='https://${orgName}.authlink.me/assets/check-circle.gif' />
            <p style="${
              OTPLESS_STYLES.SUCCESS_MODAL.TEXT
            }">Successfully signed-in with Whatsapp ðŸ¥³</p>
            <p style="${
              OTPLESS_STYLES.SUCCESS_MODAL.OK_BUTTON
            }" onclick="otplessSuccessModalClose()" >Ok  ðŸ‘</p>
        </div>
    `;
  SuccessModalDiv.style.cssText = OTPLESS_STYLES.SUCCESS_MODAL.PARENT;
  document.body.append(SuccessModalDiv);
}

function otplessSuccessModalClose() {
  var SuccessModalDiv = document.getElementById("otpless-success-modal");
  SuccessModalDiv.remove(document.body);
  window.otpless?.();
}

function otplessWaId() {
  return window.localStorage.getItem("otpless_waId");
}

document.addEventListener("DOMContentLoaded", (event) => {
  otplessSdk();
});

// function otplessSignup(signupLink) {
//     otplessUpdateStatus("signup")
//     window.open(signupLink, "_self");
// }

// function otplessSignin(signinLink) {
//     otplessUpdateStatus("signin")
//     window.open(signinLink, "_self");
// }

// function otplessUpdateStatus(status) {
//     localStorage.setItem("otpless_status", status);
// }
