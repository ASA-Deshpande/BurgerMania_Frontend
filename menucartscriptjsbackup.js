
var finalcount = 0;
var finalamt = 0;

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function burger(name, category, qty) {
  this.name = name;
  this.category = category;
  this.qty = qty;
}

var btnArr = document.getElementsByClassName("additem");
var removebtnArr = document.getElementsByClassName("btn-outline-danger");


async function getorderIdForUser(){

  try{

    let userid = getCookie('userID');

    const url = "https://localhost:7242/orderidforuser/" + userid;


    const response = await fetch(url, {
      method: 'GET',
    });

    if(!response.ok){
      throw new Error(`Network response not okay: ${response.status}, ${response.message}`);
    }

    const data = response.json();
    return data;
  }
  catch(error){
    console.error(error);
  }

}

async function removeItemFromBackend(burgerid) {

  let orderid = await getorderIdForUser();


  const url = `https://localhost:7242/api/OrderItem?orderid=${orderid}&burgerid=${burgerid}`;

  try {
    const response = await fetch(url, { method: 'DELETE' });
    if (!response.ok) {
      console.log("Not okay man!");
      throw new Error(`Response status: ${response.status}`);
    }

    console.log(response);

    await renderProcess();
    alert("Item removed from cart!");


  } catch (error) {
    console.error(error.message);
  }


}

window.removeItemFromBackend = removeItemFromBackend;


async function renderCartItemsFromBackend(burgerlist) {

  try{
    finalcount = 0;
  finalamt = 0;

  document.getElementById("cardItems").innerHTML = "";

  if ( burgerlist.length === 0) {
    console.error("Burger list is empty or not an array:", burgerlist);
    return; // Exit the function if the burger list is invalid
}


  burgerlist.forEach(item => {

    // console.log("ok")

    const itemCard = document.createElement('div');
    itemCard.className = 'cardforitem';

    var cat = item.category;
    // console.log(cat);
    var price = item.price;
    // console.log(price);
    var quant = item.qty;
    var tot = quant * price;
    finalcount += Number(quant);
    finalamt += Number(tot);

    var name = item.name;

    itemCard.innerHTML = `
                <div class="burgername"> ${name}</div>
            <div class="burgercat"> ${item.category}</div>
            <div class="price"> ${price}</div>
            <div class="quantity"> ${item.qty}</div>
            <div class="totprice"> ${tot}</div>
            <div class="removeitem" onclick="(async () => await removeItemFromBackend('${item.burgerId}'))()">❌</div>
    `

    document.getElementById("cardItems").appendChild(itemCard);

    // return burgerlist;
  })
  }
  catch(error)
  {
    console.error(error);
  }

  

  document.getElementById("summary").innerHTML = `Total Quantity is: ${finalcount} and Total Price is: ${finalamt}`;

}

async function getBurgerId(burgerName, category) {
  try {
    const response = await fetch(`https://localhost:7242/burgerid?name=${burgerName}&category=${category}`);
    if (!response.ok) {
      throw new Error(`Error fetching burger ID: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error in getBurgerId:", error);
    throw error; // Rethrow to handle it later
  }
}

async function getOrderId(userId) {
  try {
    const response = await fetch(`https://localhost:7242/orderidforuser/${userId}`);
    if (!response.ok) {
      throw new Error(`Error fetching order ID: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in getOrderId:", error);
    throw error; // Rethrow to handle it later
  }
}

async function postOrderItem(orderid, burgerId, qty) {
  try {
    const response = await fetch(`https://localhost:7242/api/OrderItem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "orderItemId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "qty": qty,
        "orderID": orderid,
        "burgerID": burgerId
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Order item created:", data);
      return data; // Return the created order item
    } else if (response.status === 409) { // Conflict
      const errorData = await response.json(); // Get the error response body
      console.log("Conflict:", errorData);
      return { orderitemidPresent: errorData.orderItemId, orderitemqtyPresent: errorData.qty, message: "Conflict" }; // Return the existing order item ID
    } else {
      throw new Error(`Error posting order item: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error in postOrderItem:", error);
    throw error; // Rethrow to handle it later
  }
}

async function updateOrderItem(orderId, burgerId, qty, orderItemId) {
  try {
    const response = await fetch(`https://localhost:7242/api/OrderItem/${orderItemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "orderItemId": orderItemId,
        "qty": qty,
        "orderID": orderId,
        "burgerID": burgerId
      }),
    });

    if (!response.ok) {
      throw new Error(`Error updating order item: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Order item updated:", data);
    return data;
  } catch (error) {
    console.error("Error in updateOrderItem:", error);
    throw error; // Rethrow to handle it later
  }
}

async function processOrder(burgerName, category, userId, qty) {
  try {
    const burgerId = await getBurgerId(burgerName, category);
    const orderId = await getOrderId(userId);

    try {
      // Attempt to post the order item
      const orderItemInfo = await postOrderItem(orderId, burgerId, qty);
      const itemIDPresent = orderItemInfo.orderitemidPresent;
      const qtyPresent = orderItemInfo.orderitemqtyPresent;

      console.log(orderItemInfo.message);
      
      if (orderItemInfo.message.includes('Conflict')) {
        console.log("present item id: ", itemIDPresent);
        if (qty != qtyPresent) {
          // If there's a conflict, update the order item instead
          await updateOrderItem(orderId, burgerId, qty, itemIDPresent);
        }

      }
    } catch (error) {
      if (error.message.includes('Conflict')) {
        // Handle conflict if not already handled in postOrderItem
        console.error("Conflict occurred while posting order item.");
      } else {
        throw error; // Rethrow other errors
      }
    }
  }
  catch (e) {
    console.error("Error processing order:", e);
  }
}

async function addOrder(btn) {

  const parentItem = btn.parentNode.parentNode;
  let choice = parentItem.getElementsByTagName("select")[0].value;
  const qty = parentItem.getElementsByClassName("qty")[0].value;
  parentItem.getElementsByClassName("qty")[0].value = "";
  parentItem.getElementsByTagName("select")[0].value = "Veg";

  let parentid = parentItem.id;

  parentid = parentid.toLowerCase();
  choice = choice.toLowerCase();

  let userid = getCookie("userID");
  console.log("user id: ", userid);

  if (qty != 0) {

    try {
      await processOrder(parentid, choice, userid, qty);
    }
    catch {

    }


    await renderProcess();
  }
  else {
    alert("Cannot add 0 items of this burger type!");
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


async function getOrderItemsForUser() {
  try {
    const token = getCookie('access_token');
    console.log("here again: ", token);

    const response = await fetch('https://localhost:7242/order', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log("accha");

    if (!response.ok) {
      const errorText = await response.text(); // Get the error response body if needed
      throw new Error(`Network response not okay: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    // console.log(data);
    // console.log("Protected Resource Data: ", data);
    return data;
  } catch (error) {
    console.error("Error: ", error);
  }

  console.log("end of fn");
}

async function getBurgerForID(burgerid)
{
  try {
    const token = getCookie('access_token');
    // console.log("here again: ", token);
    // console.log("burgerid inside getburger func: ", burgerid);

    const response = await fetch(`https://localhost:7242/api/Burger/${burgerid}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.log(response.status);
      // const errorText =  response.text(); // Get the error response body if needed
      throw new Error(`Network response not okay: ${response.status}, ${response.message}`);
    }

    const data =  response.json();
    // console.log(data);
    // console.log("Protected Resource Data: ", data);
    return data;
  } catch (error) {
    console.error("Error: ", error);
  }
}

async function getBurgerListForUser(orderitems){

  try{
    let burgerlist = []

    for (const item of orderitems) {
      let burgerid = item.burgerID;
      let orderitemid = item.orderItemId;
      let qty = item.qty;
  
      let burger = await getBurgerForID(burgerid);
      burger["orderitemid"] = orderitemid;
      burger["qty"] = qty;
  
      burgerlist.push(burger);
  }
  
    // console.log(burgerlist.length);
    return burgerlist;
  }
  catch(error){
    console.error(error);
  }
  
}

async function renderProcess(){
  let orderitems = await getOrderItemsForUser();
  // console.log("orderitems: ", orderitems);
  let burgerList = await getBurgerListForUser(orderitems);
  console.log("Burgerlist: ", burgerList);
  await renderCartItemsFromBackend(burgerList);
}

document.addEventListener('DOMContentLoaded', async function () {

  console.log("dom content loaded");
 await renderProcess();
});

