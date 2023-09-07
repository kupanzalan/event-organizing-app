// (a)

// Cecking if e-mail address is valid

// Showing submit button

let valid1,
  valid2,
  valid3 = true;

function showSubmitButton() {
  if (valid1 === false && valid2 === false && valid3 === false) {
    document.getElementById('sbutton').hidden = false;
    document.getElementById('validity').innerHTML = '';
  }
}

function myOnblurFunction() {
  const emailAddr = document.getElementById('email-addr').value;

  if (/^[^@]+@(yahoo|gmail)\.com$/i.test(emailAddr)) {
    valid1 = false;
    document.getElementById('validity').innerHTML = '';
    showSubmitButton();
  } else {
    document.getElementById('validity').innerHTML = 'E-mail not valid!';
    document.getElementById('sbutton').hidden = true;
  }
}

document.getElementById('email-addr').onblur = () => {
  myOnblurFunction();
};

// Checking if website address is correct

document.getElementById('fav-website').onblur = () => {
  const website = document.getElementById('fav-website').value;
  // let x = document.createElement('h1');
  if (/^(http:\/\/)?www\.[A-Za-z0-9_-]*\.(com|org|ro)$/i.test(website)) {
    valid2 = false;
    document.getElementById('validity').innerHTML = '';
    showSubmitButton();
  } else {
    document.getElementById('validity').innerHTML = 'URL not valid!';
    document.getElementById('sbutton').hidden = true;
  }
};

// Checking if password is OK

document.getElementById('password').onkeyup = () => {
  let passwordOk1 = false;
  let passwordOk2 = false;
  const lowerCase = /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]+)([!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{1,2})/i;
  const str = document.getElementById('password').value;

  document.getElementById('the-password').innerHTML = str;

  if (str.match(lowerCase)) {
    document.getElementById('validity').innerHTML = '';
    passwordOk1 = true;
  }

  if (str.length > 5 && str.length < 12) {
    document.getElementById('validity').innerHTML = '';
    passwordOk2 = true;
  }

  if (!(passwordOk1 === true && passwordOk2 === true)) {
    document.getElementById('validity').innerHTML = 'Password not set correctly!';
    valid3 = true;
  } else {
    valid3 = false;
    showSubmitButton();
  }
};

// (b)

// Get the direction of scrolling

let dir = document.getElementById('select').value;
let flag = 0;
if (dir === 'left') {
  flag = document.getElementById('scroll-text').parentElement.offsetWidth;
} else if (dir === 'right') {
  flag = 0;
}

const elementWidth = document.getElementById('scroll-text').offsetWidth;
// const parentWidth = document.getElementById('scroll-text').parentElement
//   .offsetWidth;

// Get the text you want to scroll

// const textLength = 0;
let textWidth = 0;

// Calculate text width

function getTextWidth(inputText) {
  this.inputText = inputText;
  const font = '16px Arial, Helvetica, sans-serif';

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = font;
  let width = 0;
  width = context.measureText(this.inputText).width;
  const formattedWidth = Math.ceil(width);

  return formattedWidth;
}

document.getElementById('textarea').onkeyup = () => {
  const str = document.getElementById('textarea').value;
  document.getElementById('scroll-text').innerHTML = str;
  // textLength = document.getElementById('scroll-text').textContent.length;

  let inputText = document.getElementById('scroll-text').textContent;

  textWidth = getTextWidth(inputText);

  if (textWidth <= elementWidth) {
    document.getElementById('scroll-text').innerHTML = `${str} ${str}`;
    inputText = document.getElementById('scroll-text').textContent;
    textWidth = getTextWidth(inputText);

    while (textWidth <= elementWidth) {
      document.getElementById('scroll-text').innerHTML = `${
        document.getElementById('scroll-text').innerHTML
      } ${str}`;
      inputText = document.getElementById('scroll-text').textContent;
      textWidth = getTextWidth(inputText);
    }
  } else {
    document.getElementById('scroll-text').innerHTML = str;
  }
};

const marqueeText = document.getElementById('scroll-text');

function Animate(element) {
  this.element = element;
  setInterval(() => {
    if (dir === 'left') {
      this.element.style.marginLeft = `${flag - 1}px`;
      if (textWidth < -flag) {
        flag = elementWidth + 40;
      }
    } else if (dir === 'right') {
      this.element.style.marginLeft = `${flag + 1}px`;
      if (textWidth + elementWidth - flag + 50 < flag) {
        flag = -textWidth;
      }
    }
  }, 10);
}

// Call the function that animates the marquee like tag
const animate = new Animate(marqueeText);
animate();

// Reset scrolling button

document.getElementById('restart-scroll').onclick = () => {
  if (dir === 'left') {
    flag = document.getElementById('scroll-text').parentElement.offsetWidth;
  } else if (dir === 'right') {
    flag = 0;
  }
};

// Get the value of the select tag

document.getElementById('select').onchange = () => {
  dir = document.getElementById('select').value;
};
