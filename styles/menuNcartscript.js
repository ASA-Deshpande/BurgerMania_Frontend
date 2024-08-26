// let myCart = JSON.parse(localStorage.getItem('myCart')) || [];
var finalcount = 0;
var finalamt = 0;

function burger(name, category, qty) {
  this.name = name;
  this.category = category;
  this.qty = qty;
}

// function $(id){
//     return document.getElementById(id);
// }

var btnArr = document.getElementsByClassName("additem");
var removebtnArr = document.getElementsByClassName("btn-outline-danger");
// console.log(btnArr);

async function removeItemFromBackend(id) {

  let foundItem = true;

  const url = "https://localhost:7242/api/MyCarts/" + id;
  console.log(url);

  try {
    const response = await fetch(url, {method: 'DELETE'});
    if (!response.ok) {
      console.log("Not okay man!");
      throw new Error(`Response status: ${response.status}`);
    }

    console.log(response);

  } catch (error) {
    foundItem = false;
    console.error(error.message);
  }

  if (!foundItem) {
    alert(
      "Item cannot be removed as it has not been previously added to cart!"
    );
  } else {
    renderCartItemsFromBackend();
    alert("Item removed from cart!");
  }

}

async function renderCartItemsFromBackend() {
   
  let myCart = [];

    const url = "https://localhost:7242/api/MyCarts";
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
  
     myCart = await response.json();
      console.log(myCart);
    } catch (error) {
      console.error(error.message);
    }
  

  finalcount = 0;
  finalamt = 0;

  // console.log("here");

  document.getElementById("cardItems").innerHTML = "";

  myCart.forEach(item => {
    const itemCard = document.createElement('div');
    itemCard.className = 'cardforitem';

    var cat = item.category;
    console.log(cat);
    var price = type_price[cat];
    console.log(price);
    var quant = item.qty;
    var tot = quant * price;
    finalcount += Number(quant);
    finalamt += Number(tot);

    var type = item.name;
    var actualname = type_name[type];

    itemCard.innerHTML = `
                <div class="burgername"> ${actualname}</div>
            <div class="burgercat"> ${item.category}</div>
            <div class="price"> ${price}</div>
            <div class="quantity"> ${item.qty}</div>
            <div class="totprice"> ${tot}</div>
            <div class="removeitem" onclick="removeItemFromBackend('${item.id}')">❌</div>
    `

    document.getElementById("cardItems").appendChild(itemCard);


  })


  document.getElementById("summary").innerHTML = `Total Quantity is: ${finalcount} and Total Price is: ${finalamt}`;

}

async function addOrder(btn){
  
    const parentItem = btn.parentNode.parentNode;
    const choice = parentItem.getElementsByTagName("select")[0].value;
    const qty = parentItem.getElementsByClassName("qty")[0].value;
    parentItem.getElementsByClassName("qty")[0].value = "";
    parentItem.getElementsByTagName("select")[0].value = "Veg";
  
    const parentid = parentItem.id;

    if(qty != 0){
      let body = {};

      await fetch(`https://localhost:7242/exists?name=${parentid}&type=${choice}`)
     .then(response => response.json())
     .then(async data =>
     {
       console.log("Inside check")
       console.log(data);
       console.log(data.exists);
       console.log(data.quantity);
       //Update
       if(data.exists && (Number(qty) != Number(data.quantity))){
        
         body =    {
           "id": data.guid,
           "name": parentid,
           "category": choice,
           "qty": Number(qty),
           "price": 0
         }
     
 
          await fetch(`https://localhost:7242/api/MyCarts/${data.guid}`, {
           method: 'PUT',
           body: JSON.stringify(body),
           headers: {
             "Content-Type": "application/json"
           }
         })
 
         .then(response => console.log(response))
         .catch(error => {
             console.error(error);
           });
     
         console.log("Gonna render put");
       }
 
       //post 
       else if (!data.exists){
 
         body = {
           "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
           "name": parentid,
           "category": choice,
           "qty": Number(qty),
           "price": 0
         };
     
 
          await fetch('https://localhost:7242/api/MyCarts', {
           method: 'POST',
           body: JSON.stringify(body),
           headers: {
             "Content-Type": "application/json"
           }
         })
         .then(data => data.json())
         .then(response => {
           console.log("Inside POST body");
           console.log(response)})
           .catch(error => {
             console.log(error.message);
           });
     
         console.log("Gonna render post");
       }
     }
     )
 
 
     renderCartItemsFromBackend();
    }
    else{
      alert("Cannot add 0 items of this burger type!");
    }



}

//unused
function addItem(btn) {

  // console.log("Inside add item")
  console.log(myCart);
  // console.log(btn);
  //   console.log(btn.parentNode.parentNode.id);
  // console.log(
  //     btn.parentNode.parentNode.getElementsByTagName("select")[0].value
  // );

  const parentItem = btn.parentNode.parentNode;
  const choice = parentItem.getElementsByTagName("select")[0].value;
  const qty = parentItem.getElementsByClassName("qty")[0].value;
  parentItem.getElementsByClassName("qty")[0].value = "";
  parentItem.getElementsByTagName("select")[0].value = "Veg";

  const parentid = parentItem.id;


  let donotAdd = false;

  for (let i = 0; i < myCart.length; i++) {
    // console.log(myCart[i].name);
    if (myCart[i].name === parentid && (myCart[i].category === choice)) {

      if (myCart[i].qty != qty && qty != 0) {
        alert("Updating the quantity...");
        myCart[i].qty = qty;
        localStorage.setItem('myCart', JSON.stringify(myCart));
        donotAdd = true;
        break;
      }

      // donotAdd = true;
      // alert("Item has already been added to cart!");
      // break;
    }
  }

  if (!donotAdd) {

    if (qty == 0) {
      alert("Cannot add 0 items of this burger type!");
    }
    else {
      // console.log(qty);
      // console.log(choice);
      // console.log(parentid);

      const burgerOrder = new burger(parentid, choice, qty);
      // console.log(Object.keys(burgerOrder));
      myCart.push(burgerOrder);
      localStorage.setItem('myCart', JSON.stringify(myCart));
      alert("Item has been added to the cart");
      // console.log(myCart);
    }

  }

  renderCartItems();
}

//unused
function removeItem(btn, type) {
  // console.log("Inside remove item");
  // console.log(myCart);

  //   const parentItem = btn.parentNode.parentNode;

  //   const parentid = parentItem.id;

  const parentid = btn;

  let foundItem = false;

  for (let i = 0; i < myCart.length; i++) {
    if (myCart[i].name === parentid && (myCart[i].category === type)) {
      myCart.splice(i, 1);
      localStorage.setItem('myCart', JSON.stringify(myCart));

      foundItem = true;
      break;
    }
  }

  if (!foundItem) {
    alert(
      "Item cannot be removed as it has not been previously added to cart!"
    );
  } else {
    renderCartItems();
    alert("Item removed from cart!");
  }
}

for (var i = 0; i < btnArr.length; i++) {
  let mybtn = btnArr[i]; //ithe var kelyamule chukat hota
  // console.log(mybtn.id);
  // console.log(btnArr[i]);
  mybtn.onclick = function outer() {
    //console.log(mybtn.id);
    addOrder(mybtn);
  };
  // btnArr[i].onclick = (()=> {console.log("clicked")})
  // console.log(btnArr[i]);
}

//unused
// for (var i = 0; i < removebtnArr.length; i++) {
//   let mybtn = removebtnArr[i];

//   mybtn.onclick = function outer() {
//     console.log(mybtn.id);
//     removeItem(mybtn.parentNode.parentNode.id);
//   };
// }


const type_price = {
  "Veg": 100,
  "Egg": 150,
  "Chicken": 200
}

const type_name = {
  "crispy": "Crispy Supreme",
  "surprise": "Surprise",
  "whopper": "Whopper",
  "chillicheese": "Chilli Cheese",
  "tandoori": "Tandoor Grill"
}


function renderCartItems() {


  finalcount = 0;
  finalamt = 0;

  console.log("here");

  document.getElementById("cardItems").innerHTML = "";

  myCart.forEach(item => {
    const itemCard = document.createElement('div');
    itemCard.className = 'cardforitem';

    var cat = item.category;
    console.log(cat);
    var price = type_price[cat];
    console.log(price);
    var quant = item.qty;
    var tot = quant * price;
    finalcount += Number(quant);
    finalamt += Number(tot);

    var type = item.name;
    var actualname = type_name[type];

    itemCard.innerHTML = `
                <div class="burgername"> ${actualname}</div>
            <div class="burgercat"> ${item.category}</div>
            <div class="price"> ${price}</div>
            <div class="quantity"> ${item.qty}</div>
            <div class="totprice"> ${tot}</div>
            <div class="removeitem" onclick="removeItem('${item.name}', '${item.category}')">❌</div>
    `

    document.getElementById("cardItems").appendChild(itemCard);


  })


  document.getElementById("summary").innerHTML = `Total Quantity is: ${finalcount} and Total Price is: ${finalamt}`;

  // console.log(myCart);

  //   for (let i = 0; i < myCart.length; i++) {
  //     console.log(myCart[i]);

  //     var cartItem = document.createElement("div");

  //     cartItem.classList.add("cardforitem");
  //     let burgername = document.createElement("div");
  //     burgername.innerHTML = myCart[i].name;

  //     let burgercategory = document.createElement("div");
  //     burgercategory.innerHTML = myCart[i].category;

  //     let burgerprice = document.createElement("div");
  //     burgerprice.innerHTML = "200";

  //     let burgerqty = document.createElement("div");
  //     burgerqty.innerHTML = myCart[i].qty;

  //     let burgertotprice = document.createElement("div");
  //     burgertotprice.innerHTML = "200";

  //     let removeicon = document.createElement("div");
  //     removeicon.innerHTML = "❌";

  //     cartItem.appendChild(burgername);
  //     cartItem.appendChild(burgercategory);
  //     cartItem.appendChild(burgerprice);
  //     cartItem.appendChild(burgerqty);
  //     cartItem.appendChild(burgertotprice);
  //     cartItem.appendChild(removeicon);

  //     document.getElementById("cardItems").appendChild(cartItem);
  //   }
}

document.getElementById("placeorderbtn").onclick = function () {
  var numAmtDisplayed = Number(finalamt);
  var discountPerc;

  if (numAmtDisplayed >= 500 && numAmtDisplayed < 1000) {
    discountPerc = 5;
  }
  else if (numAmtDisplayed >= 1000) {
    discountPerc = 10;
  }
  else {
    discountPerc = 0;
  }

  var amtDisplayedAfterDiscount = numAmtDisplayed - (numAmtDisplayed * (discountPerc / 100));

  alert(`The total amount is: ${numAmtDisplayed} and you are getting discount of ${discountPerc}%, hence the final amount to be paid is ${amtDisplayedAfterDiscount}`);

}

document.addEventListener('DOMContentLoaded', function () {
  renderCartItemsFromBackend();
});

