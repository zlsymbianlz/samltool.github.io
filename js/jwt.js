
// XXX Hack to prevent hextorstr function used by JWS send a string instead of
// a Word Array. On this way, no string decoding needs to take place and Crypto
// takes care of everything.
// Note that it should not affect the other algorithms as hextorstr is exclusively
// used on Hmac family (that invokes CryptoJS library).
window.hextorstr = function (c) {
  return window.CryptoJS.enc.Hex.parse(c);
};


//this is used to parse base64
function url_base64_decode(str) {
  var output = str.replace('-', '+').replace('_', '/');
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += '==';
      break;
    case 3:
      output += '=';
      break;
    default:
      throw 'Illegal base64url string!';
  }
  return window.atob(output); //polifyll https://github.com/davidchambers/Base64.js
}

window.decode = function (base64token) {
  var xml = null, error = null;
  try {
    xml = url_base64_decode(base64token);
  } catch (e) {
    error = e;
  }
  return {result: xml, error: error};
};

window.sign = function (header, payload, secret, isSecretBase64Encoded) {
  var value = '', error = null, headerAsJSON, payloadAsJSON;

  try {
    headerAsJSON = JSON.stringify(JSON.parse(header));
  } catch (e) {
    error = {result: null, error: {cause: e, who: ['header']}};
  }
  try {
    payloadAsJSON = JSON.stringify(JSON.parse(payload));
  } catch (e) {
    if (error) {
      error.error.who.push('payload');
    } else {
      error = {result: null, error: {cause: e, who: ['payload']}};
    }
  }

  if (error) {
    return error;
  }

  if (isSecretBase64Encoded) {
    try {
      secret = window.b64utob64(secret);
      secret = window.CryptoJS.enc.Base64.parse(secret).toString();
    } catch (e) {
      return {result: '', error: e};
    }
  } else {
    secret = window.CryptoJS.enc.Latin1.parse(secret).toString();
  }

  try {
    value = KJUR.jws.JWS.sign(null, headerAsJSON, payloadAsJSON, secret);
  } catch (e) {
    error = e;
  }

  return {result: value, error: error};
};

window.isValidBase64String = function (s) {
  try {
    s = window.b64utob64(s);
    window.CryptoJS.enc.Base64.parse(s).toString();
    return true;
  } catch (e) {
    return false;
  }
};

window.verify = function (value, secret, isSecretBase64Encoded) {
  var result = '', error = null;

  if (isSecretBase64Encoded) {
    try {
      secret = window.b64utob64(secret);
      secret = window.CryptoJS.enc.Base64.parse(secret).toString();
    } catch (e) {
      return {result: '', error: e};
    }
  } else {
    secret = window.CryptoJS.enc.Latin1.parse(secret).toString();
  }

  try {
    result = KJUR.jws.JWS.verify(value, secret);
  } catch (e) {
    error = e;
  }

  return {result: result, error: error};
};
