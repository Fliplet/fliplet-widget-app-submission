
const authKeyInput = document.getElementById('fl-push-authKey');
const keyIdInput = document.getElementById('fl-push-keyId');
const teamIdInput = document.getElementById('fl-store-teams'); 
const bundleIdInput = document.getElementById('fl-store-bundleId'); 

const testConfigButton = document.getElementById('fl-push-testConfigButton');
const testResultMessage = document.getElementById('fl-push-testResultMessage');

const MESSAGE = {
  SUCCESS: 'Success! Push notifications have been configured successfully.',
  ERROR_INPUT: 'Error - notifications have not beeen configured, please check the details you have entered and try again',
  ERROR_SERVER: 'Error - notifications have not been configured correctly. Please review <a href="https://help.fliplet.com" target="_blank">https://help.fliplet.com</a> or contact support.',
  ERROR_NO_KEY: '<strong>Authentication key</strong> is missing, please check provided information and try again',
  ERROR_NO_KEYID: '<strong>Key ID</strong> is missing, please check provided information and try again',
  ERROR_NO_TEAMID: '<strong>Developer team</strong> is missing, please check selected team in section: <strong>App Store > 5 - App technical details</strong>, and try again',
  ERROR_NO_BUNDLEID: '<strong>Bundle ID</strong> is missing, please check Bundle ID: <strong>App Store > 5 - App technical details</strong>, and try again',
  ERROR_SERVICE: 'Error - There is currently an issue relating to APNs services. Please try again later.'
};

const mappedMessages = {
  BadDeviceToken: MESSAGE.SUCCESS,
  ExpiredProviderToken: MESSAGE.ERROR_INPUT,
  InvalidProviderToken: MESSAGE.ERROR_INPUT,
  TooManyRequests: MESSAGE.ERROR_SERVICE,
  InternalServerError: MESSAGE.ERROR_SERVICE,
  ServiceUnavailable: MESSAGE.ERROR_SERVICE,
  Shutdown: MESSAGE.ERROR_SERVICE,
}

const renderResultMessage = (resultMessage) => {
  if (!resultMessage) {
    testResultMessage.style.display = 'none';
    testResultMessage.innerHTML = '';

    return;
  }

  testResultMessage.style.display = 'block';
  testResultMessage.innerHTML = resultMessage;

  const success = resultMessage === MESSAGE.SUCCESS;

  testResultMessage.classList.toggle('text-success', success);
  testResultMessage.classList.toggle('text-danger', !success);
};

const validateApnKey = async({ apnAuthKey, apnKeyId, apnTeamId, apnTopic }) => {
  const currentAppId = Fliplet.Env.get('appId');

  try {
    const response = await fetch(`/v1/apps/${currentAppId}/notifications/validate-apns-config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apnAuthKey, apnKeyId, apnTeamId, apnTopic }),
    });

    if (response.status === 200) {
      const { 0: { message: { 0: { errorMsg } } } } = response.json();
  
      const message = mappedMessages[errorMsg];

      if (message) {
        return message;
      }
    }

    return MESSAGE.ERROR_SERVER;
  } catch (error) { 
    // eslint-disable-next-line no-console
    console.error('Failed to send message:', error);

    return MESSAGE.ERROR;
  }
};

testConfigButton.addEventListener('click', async() => {
  renderResultMessage(null);

  let resultMessage = null;

  const apnAuthKey = authKeyInput.value;
  const apnKeyId = keyIdInput.value;
  const apnTeamId = teamIdInput.value;
  const apnTopic = bundleIdInput.value;


  if (!apnAuthKey) {
    resultMessage = MESSAGE.ERROR_NO_KEY;
  } else if (!apnKeyId) {
    resultMessage = MESSAGE.ERROR_NO_KEYID;
  } else if (!apnTeamId) {
    resultMessage = MESSAGE.ERROR_NO_TEAMID;
  } else if (!apnTopic) {
    resultMessage = MESSAGE.ERROR_NO_BUNDLEID;
  } else {
    resultMessage = await validateApnKey({ apnAuthKey, apnKeyId, apnTeamId, apnTopic });
  }

  renderResultMessage(resultMessage);
});

const clearMessage = () => {
  renderResultMessage(null);
};

authKeyInput.addEventListener('input', clearMessage);
keyIdInput.addEventListener('input', clearMessage);
teamIdInput.addEventListener('input', clearMessage);

function goToTechDetails() {
  const appStoreTab = document.querySelector('[href="#appstore-tab"]');
  const techDetailsDropdownAnchor = document.querySelector('[href="#appStoreTech"]');
  const techDetailsDropdown = document.getElementById('appStoreTech');

  appStoreTab.click();
  
  if (techDetailsDropdown.getAttribute('aria-expanded') !== 'true') {
    techDetailsDropdownAnchor.click();
  }
}