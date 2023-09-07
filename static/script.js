const buttonClick = (name) => {
  const buttonText = document.getElementById(`button-${name}`).innerHTML;
  if (buttonText === 'Join') {
    console.log('Join button');
    fetch(`/join?event=${name}`)
      .then((response) => {
        if (response.ok === false) {
          throw Error(response.statusText);
        } else {
          return response.json();
        }
      })
      .then((result) => {
        const row = document.getElementById(`row-${name}`);
        const oldLi = document.getElementById(`li-${name}`);
        const newLi = document.createElement('li');
        newLi.innerHTML = result.name;
        newLi.className = 'myLiClass';
        newLi.id = `li-org-${result.name}`;
        row.insertBefore(newLi, oldLi);
        document.getElementById(`button-${name}`).innerHTML = 'Cancel';
      })
      .catch((error) => {
        console.log(error);
      });
  } else if (buttonText === 'Cancel') {
    console.log('Cancel button');
    fetch(`/cancel?event=${name}`)
      .then((response) => {
        if (response.ok === false) {
          throw Error(response.statusText);
        } else {
          return response.json();
        }
      })
      .then((result) => {
        console.log(result.name);
        const parentNode = document.getElementById(`row-${name}`);
        const orgNode = document.getElementById(`li-org-${result.name}`);
        parentNode.removeChild(orgNode);
        document.getElementById(`button-${name}`).innerHTML = 'Join';
      })
      .catch((error) => {
        console.log(error);
      });
  }
};

const drawElements = (params) => {
  const [result, name] = params;

  document.getElementById(`row-${name}`).innerHTML = '';
  result.then((res) => {
    res.forEach((element) => {
      const node = document.createElement('li');
      node.className = 'myLiClass';
      node.id = `li-org-${element.name}`;
      const text = document.createTextNode(element.name);
      node.appendChild(text);
      document.getElementById(`row-${name}`).appendChild(node);
    });
    const nextNode = document.createElement('li');
    nextNode.className = 'myLiClass';
    nextNode.id = `li-${name}`;
    const button = document.createElement('button');
    // Getting button text data
    const loggedInUser = document.getElementById('logged-in-user').innerHTML.split(',')[1].trim();
    let buttonText = '';
    return fetch(`/getorganizer?username=${loggedInUser}&eventid=${name}`)
      .then((response) => response.json())
      .then((resButton) => {
        if (resButton.length === 0) {
          buttonText = 'Join';
        } else {
          buttonText = 'Cancel';
        }
        button.onclick = () => { buttonClick(name); };
        button.innerHTML = buttonText;
        button.className = 'myButtonClass';
        button.id = `button-${name}`;
        nextNode.appendChild(button);
        document.getElementById(`row-${name}`).appendChild(nextNode);
        return buttonText;
      })
      .catch((error) => {
        console.error(error);
      });
  });
  document.getElementById(`row-${name}`).style.display = 'inline';
};

const fetchOrganizers = (listItem) => {
  listItem.addEventListener('click', (e) => {
    document.getElementById('errors').innerHTML = '';
    const name = e.target.parentElement.firstElementChild.innerHTML;
    fetch(`/fetchlist?name=${name}`)
      .then((response) => {
        if (response.ok === false) {
          throw Error(response.statusText);
        } else {
          return [response.json(), name];
        }
      })
      .then((params) => {
        drawElements(params);
      })
      .catch((error) => {
        console.error(error);
        document.getElementById('errors').innerHTML = error;
      });
  });
};

window.onload = () => {
  const trs = Array.from(document.getElementsByClassName('list'));
  trs.forEach(fetchOrganizers);
};
