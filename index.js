import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  remove,
  set,
  get,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const appSettings = {
  databaseURL: "https://togetapp-c9973-default-rtdb.firebaseio.com/",
};
//Real Time DB
const app = initializeApp(appSettings);
const database = getDatabase(app);
const groceryInDB = ref(database, "grocery");
const groceryRestored = ref(database, "grocery-restored");

const inputFieldEl = document.getElementById("input-field");
const addButtonEl = document.getElementById("add-button");
const showButtonEl = document.getElementById("show-button");
const shoppingListEl = document.getElementById("shopping-list");

let dbItems = 0; // Initialize dbItems variable

addButtonEl.addEventListener("click", function () {
  let inputValue = inputFieldEl.value;
  if (inputValue === "") {
    alert("Input field cannot be empty");
  } else {
    push(groceryInDB, inputValue);
    clearInputFieldEl();
    updateItemCount(inputValue); // Pass inputValue as a parameter
  }
});

showButtonEl.addEventListener("click", () => {
  clearShoppingListEl();
  onValue(groceryRestored, (snapshot) => {
    if (snapshot.exists()) {
      let itemsArray = Object.entries(snapshot.val());

      for (let i = 0; i < itemsArray.length; i++) {
        let currentItem = itemsArray[i];
        let currentItemID = currentItem[0];
        let currentItemValue = currentItem[1];
        appendItemToShoppingListEl(currentItem);
      }
    } else {
      shoppingListEl.innerHTML = "No items restored yet";
    }
  });
});

function clearInputFieldEl() {
  inputFieldEl.value = "";
}

function clearShoppingListEl() {
  shoppingListEl.innerHTML = "";
}

onValue(groceryInDB, function (snapshot) {
  if (snapshot.exists()) {
    let itemsArray = Object.entries(snapshot.val());
    clearShoppingListEl();

    for (let i = 0; i < itemsArray.length; i++) {
      let currentItem = itemsArray[i];
      let currentItemID = currentItem[0];
      let currentItemValue = currentItem[1];

      appendItemToShoppingListEl(currentItem);
    }
  } else {
    let emptyCart = document.createElement("img");
    emptyCart.setAttribute("src", "./images/empty_cart.jpg");
    emptyCart.style.width = "100%";
    emptyCart.style.height = "100%";
    emptyCart.style.objectFit = "contain";
    emptyCart.style.objectPosition = "center";
    shoppingListEl.append(emptyCart);
  }
});

function appendItemToShoppingListEl(item) {
  let itemID = item[0];
  let itemValue = item[1];

  let newEl = document.createElement("li");
  newEl.textContent = itemValue;

  newEl.addEventListener("dblclick", () => {
    const itemRef = ref(database, `grocery/${itemID}`);
    get(itemRef).then((snapshot) => {
      if (snapshot.exists()) {
        const itemData = snapshot.val();
        remove(ref(database, `grocery/${itemID}`));
        set(ref(database, `grocery-restored/${itemID}`), itemData);
        notifyMe(itemValue + "  deleted from Cart");
        updateItemCount();
      }
    });
  });

  shoppingListEl.append(newEl);
}

function notifyMe(message) {
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  } else if (Notification.permission === "granted") {
    showNotification(message);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        showNotification(message);
      }
    });
  }
}

function showNotification(message) {
  const notification = new Notification("Cart Changed", {
    body: message,
    icon: "https://i.pinimg.com/564x/2f/eb/8a/2feb8af81e45b119cd07937553c886c2.jpg",
    image:
      "https://i.pinimg.com/564x/a6/9b/bd/a69bbd9fea8608c7b9934fef3dc5ecdd.jpg",
  });
}

function updateItemCount(inputValue) {
  return get(groceryInDB).then((snapshot) => {
    if (snapshot.exists()) {
      const itemsArray = Object.entries(snapshot.val());
      const dbItems = itemsArray.length; // Calculate dbItems value
      notifyMe(inputValue + "  added to Cart. + " + dbItems + " Items"); // Update notification message
    } else {
      notifyMe(inputValue + "  Is the Only Item In Cart"); // Update notification message for no items
    }
  });
  // .catch((error) => {
  //   console.error("Error retrieving directory data:", error);
  //   throw error; // Throw the error to handle it elsewhere, if needed
  // });
}


// actions: [
// {
//   action: "actionYes",
//   title: "Yes",
//   icon: "https://i.pinimg.com/564x/2f/eb/8a/2feb8af81e45b119cd07937553c886c2.jpg",
// },
// {
//   action: "actionNo",
//   title: "No",
//   icon: "https://i.pinimg.com/564x/2f/eb/8a/2feb8af81e45b119cd07937553c886c2.jpg",
// },
// ], 
